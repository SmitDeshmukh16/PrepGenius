from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import re
import numpy as np
import faiss
import torch
import yt_dlp
import webvtt
from sentence_transformers import SentenceTransformer, util
from google import genai
from dotenv  import load_dotenv
import os
import tempfile
load_dotenv()
# ========= Configuration =========
app = FastAPI()
client  = genai.Client(api_key=os.getenv("Test_API_KEY"))
model = os.getenv("GEMINI_MODEL")
config = genai.types.GenerateContentConfig(
    system_instruction="You are an educational assistant that helps users understand YouTube video content. You provide summaries and answer questions based STRICTLY on the video transcript provided. Never use information outside what's explicitly in the transcript. If asked about something not covered in the transcript, respond with 'This information is not available in the transcript.'",
    temperature=0.3,
    response_mime_type="text/plain"
)
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

# ========= In-memory storage =========
video_memory = {}

# ========= Request Models =========
class VideoRequest(BaseModel):
    url: str

class ChatRequest(BaseModel):
    session_id : str
    question: str

# ========= Helper Functions =========
def extract_video_id(url: str) -> str:
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11})", url)
    return match.group(1) if match else None

def get_transcript(video_id: str) -> str | None:
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    with tempfile.TemporaryDirectory() as tmpdir:
        try:
            ydl_opts = {
                'skip_download': True,
                'writesubtitles': True,
                'writeautomaticsub': True,
                'subtitleslangs': ['en'],
                'subtitlesformat': 'vtt',
                'outtmpl': os.path.join(tmpdir, '%(id)s.%(ext)s'),
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([video_url])

            vtt_path = os.path.join(tmpdir, f"{video_id}.en.vtt")
            if not os.path.exists(vtt_path):
                return None

            transcript = " ".join([caption.text for caption in webvtt.read(vtt_path)])
            return transcript

        except Exception as e:
            print(f"[Transcript Error] {e}")
            return None

def chunk_text(text: str, chunk_size=1000, overlap=200) -> list[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunks.append(" ".join(words[i:i + chunk_size]))
        i += chunk_size - overlap
    return chunks

def generate_summary(context: str) -> str:
    prompt = f"Summarize the following video transcript in bullet points using markdown:\n\n{context}\n\nSummary:"

    response = client.models.generate_content(
        model=model,contents=prompt, config=config)
    return response.text.strip()

# ========= API Routes =========

@app.post("/summary")
def load_video(req: VideoRequest):
    video_id = extract_video_id(req.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    if video_id in video_memory:
        return {"message": "Video already loaded.", "summary": video_memory[video_id]["summary"]}

    transcript = get_transcript(video_id)
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not available")

    chunks = chunk_text(transcript)
    embeddings = embed_model.encode(chunks, convert_to_tensor=True)

    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings.cpu().numpy())

    # Get central context for summary
    centroid = torch.mean(embeddings, dim=0, keepdim=True)
    dists = torch.norm(embeddings - centroid, dim=1)
    top_k = torch.topk(dists, k=5, largest=False).indices
    context = "\n".join([chunks[i] for i in top_k])
    summary = generate_summary(context)

    # Store in memory
    video_memory[video_id] = {
        "chunks": chunks,
        "embeddings": embeddings,
        "index": index,
        "summary": summary
    }

    return {"session_id": video_id, "summary": summary}

@app.post("/ask")
def chat(req: ChatRequest):
    video_id = req.session_id
    if video_id not in video_memory:
        raise HTTPException(status_code=404, detail="Video not loaded. Please load it first.")

    memory = video_memory[video_id]
    query_embedding = embed_model.encode([req.question], convert_to_tensor=True)

    hits = util.semantic_search(query_embedding, memory["embeddings"], top_k=3)[0]
    context = "\n".join([memory["chunks"][hit["corpus_id"]] for hit in hits])

    prompt = (
        "You are a helpful assistant. Use the transcript below to answer the user's question as accurately as possible. "
        "Respond in markdown format with bullet points or short paragraphs as needed.\n\n"
        f"**Transcript:**\n{context}\n\n"
        f"**Question:** {req.question}\n\n"
        "**Answer:**"
    )

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=config
    )

    # Return answer as markdown with question included
    return {
        "answer": response.text.strip()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)