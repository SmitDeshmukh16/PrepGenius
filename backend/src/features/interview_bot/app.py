from fastapi import FastAPI, UploadFile, File, Form, WebSocket
from fastapi.responses import FileResponse,JSONResponse
import os
from pydantic import BaseModel
import json
import uuid
import cv2
import numpy as np
import asyncio
import base64

from .models.interviewbot import InterviewBot,CandidateInfo

from .models.face_mesh_detector import get_eye_contact_ratio
from .models.head_movement_tracker import detect_head_movement
from .models.emotion_recognition import get_facial_expression_score
from .utils.confidence_calculator import calculate_confidence

app = FastAPI()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Ensure the upload directory exists

interview_sessions = {}

class CandidateRequest(BaseModel):
    name: str
    education: str
    skills: str
    position: str
    experience: str
    projects: str

@app.post("/start_interview/")
def start_interview(candidate: CandidateRequest):
    candidate_info = CandidateInfo(**candidate.dict())
    bot = InterviewBot(candidate_info)
    session_id = str(uuid.uuid4())  
    interview_sessions[session_id] = bot
    response = bot.start_interview()
    return {
        "session_id": session_id,
        "question": response['question'],
        "difficulty_level": response['difficulty_level'],
        "audio_file_url": f"/download_audio/?file={response['audio_file']}"
    }


@app.post("/answer_question/")
async def answer_question(session_id: str, audio_file: UploadFile = File(None), text: str = Form(None)):
    if session_id not in interview_sessions:
        return JSONResponse(content={"error": "Invalid session ID"}, status_code=400)

    if not audio_file and not text:
        return JSONResponse(content={"error": "No audio file or text provided"}, status_code=400)
    
    file_path = None
    if audio_file:
        # Generate a unique filename
        file_name = f"{uuid.uuid4()}.wav"
        file_path = os.path.join(UPLOAD_DIR, file_name)
    
        with open(file_path, "wb") as buffer:
            buffer.write(await audio_file.read())
    
    bot = interview_sessions[session_id]
    response = bot.answerandquestion(file_path)
    
    return {
        "question": response["question"],
        "difficulty_level": response["difficulty_level"],
        "interview_done": response["interview_done"],
        "audio_file_url": f"/download_audio/?file={response['audio_file']}"
    }

@app.get("/download_audio/")
def download_audio(file: str):
    """ Serve the generated audio file """
    file_path = os.path.join(UPLOAD_DIR, os.path.basename(file))
    if not os.path.exists(file_path):
        return JSONResponse(content={"error": "File not found."}, status_code=404)
    return FileResponse(file_path, media_type="audio/wav", filename=os.path.basename(file))

@app.get("/get_results/")
def get_results(session_id: str):
    if session_id not in interview_sessions:
        return JSONResponse(content={"error": "Invalid or expired session ID."}, status_code=400)
    
    bot = interview_sessions[session_id]
    response = bot.exit_interview()
    return response

@app.websocket("/video_stream")
async def video_stream(websocket: WebSocket):
    await websocket.accept()
    prev_frame = None
    confidence_scores = []

    try:
        while True:
            data = await websocket.receive_text()

            try:
                json_data = json.loads(data)
                if 'close' in json_data:
                    return  # triggers finally block and still runs cleanup logic

                frame_data = json_data.get("frame")
                if not frame_data:
                    continue

                frame_bytes = base64.b64decode(frame_data)
                frame_np = np.frombuffer(frame_bytes, dtype=np.uint8)
                frame = cv2.imdecode(frame_np, cv2.IMREAD_COLOR)
                if frame is None:
                    continue

            except Exception as e:
                print(f"Frame decoding error: {e}")
                continue

            try:
                eye_contact = get_eye_contact_ratio(frame)
                expression = get_facial_expression_score(frame)
                head_movement_penalty = detect_head_movement(frame, prev_frame) if prev_frame is not None else 0
                prev_frame = frame.copy()

                score = calculate_confidence(eye_contact, expression, head_movement_penalty)
                confidence_scores.append(score)

                if len(confidence_scores) % 10 == 0:
                    avg_score = sum(confidence_scores) / len(confidence_scores)
                    await websocket.send_json({
                        "average_confidence_score": round(avg_score, 2)
                    })

            except Exception as e:
                print(f"Frame processing error: {e}")
                continue

    except Exception as e:
        print(f"WebSocket error: {e}")

    finally:
        try:
            if confidence_scores:
                final_avg = sum(confidence_scores) / len(confidence_scores)
                feedback = get_suggestions(final_avg)
            else:
                final_avg = 0
                feedback = "No confidence data was captured."

            await websocket.send_json({
                "average_confidence_score": round(final_avg, 2),
                "final_suggestion": feedback
            })

            await asyncio.sleep(0.2)  # brief delay to ensure message is sent

        except Exception as e:
            print(f"Final send error: {e}")

        await websocket.close()

def get_suggestions(confidence):
    """ Provide feedback based on confidence score """
    if confidence >= 8:
        return "Great job! Maintain steady eye contact and a calm expression."
    elif confidence >= 5:
        return "Try improving eye contact and reducing head movements."
    else:
        return "Work on reducing nervous gestures and practicing relaxed facial expressions."

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)