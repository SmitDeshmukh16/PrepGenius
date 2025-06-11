import os
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from PyPDF2 import PdfReader
from werkzeug.utils import secure_filename
from typing import Optional
from google.genai import types
import pathlib
from pydantic import BaseModel,ConfigDict # Import BaseModel

# Load API key from .env
load_dotenv()
client = genai.Client(api_key=os.getenv("Test_API_KEY"))
model  = os.getenv("GEMINI_MODEL")
# FastAPI app setup
app = FastAPI(title="Resume ATS Score Analyzer")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure upload folder
UPLOAD_FOLDER = os.path.join(
    "src", "features", "resume_analyzer", "uploads")
ALLOWED_EXTENSIONS = {"pdf"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure upload folder exists

# Function to check allowed file type
def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to extract text from PDF (not directly used with Gemini's PDF handling, but kept for completeness)
def read_pdf(file_path: str) -> str:
    pdf_reader = PdfReader(file_path)
    pdf_text = "".join([page.extract_text() or "" for page in pdf_reader.pages])
    return pdf_text.strip()

# Function to get AI response from Gemini


# Pydantic models for the different analysis outputs
class QuickScanOutput(BaseModel):
    most_suitable_profession: str
    strengths: list[str]
    improvements: list[str]
    ats_score: int

    
class Ratings(BaseModel):
    Impact: int
    Brevity: int
    Style: int
    Structure: int
    Skills: int

  
class SectionReview(BaseModel):
    Summary: str
    Experience: str
    Education: str

   

class DetailedAnalysisOutput(BaseModel):
    most_suitable_profession: str
    strengths: list[str]
    improvements: list[str]
    ratings: Ratings
    section_review: SectionReview
    ats_score: int
    ats_reasoning: str

   

class ATSOptimizationOutput(BaseModel):
    missing_keywords: list[str]
    ats_friendly_formatting: str
    keyword_optimizations: list[str]
    job_specific_suggestions: list[str]
    ats_compatibility_score: int


def get_gemini_output(file_path: str, prompt: str,analysis_option: str) :
    filepath = pathlib.Path(file_path)
    if analysis_option =="Quick Scan":
        configi=types.GenerateContentConfig(
          response_mime_type='application/json',
          response_schema= QuickScanOutput
      )
    elif analysis_option == "Detailed Analysis":
        configi=types.GenerateContentConfig(
          response_mime_type='application/json',
          response_schema= DetailedAnalysisOutput
      )
    else:  # ATS Optimization
        configi=types.GenerateContentConfig(
          response_mime_type='application/json',
          response_schema= ATSOptimizationOutput
      )
    response = client.models.generate_content(
        model=model,
        contents=[
        types.Part.from_bytes(
        data=filepath.read_bytes(),
        mime_type='application/pdf',
        ),
      prompt],config=configi
    )
    
    return response.parsed  # Ensure correct attribute
@app.post("/score")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: Optional[str] = Form(""),
    analysis_option: str = Form(...),
):
    if not allowed_file(resume.filename):
        raise HTTPException(status_code=400, detail="Invalid file! Please upload a PDF.")
    
    # Securely save the uploaded file
    filename = secure_filename(resume.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(file_path, "wb") as f:
        f.write(await resume.read())
    
    # Define prompts for different analysis types
    if analysis_option == "Quick Scan":
        prompt = f"""
        You are ResumeChecker, an expert in resume analysis. Provide a quick scan in JSON format:
        {{
            "most_suitable_profession": "string",
            "strengths": ["string", "string", "string"],
            "improvements": ["string", "string"],
            "ats_score": "integer out of 100"
        }}
        
        Resume: pdf_file
        Job Description: {job_description}
        """
    elif analysis_option == "Detailed Analysis":
        prompt = f"""
        You are ResumeChecker, an expert in resume analysis. Provide a detailed analysis in JSON format:
        {{
            "most_suitable_profession": "string",
            "strengths": ["string", "string", "string", "string", "string"],
            "improvements": ["string", "string", "string", "string", "string"],
            "ratings": {{
                "Impact": "integer out of 10",
                "Brevity": "integer out of 10",
                "Style": "integer out of 10",
                "Structure": "integer out of 10",
                "Skills": "integer out of 10"
            }},
            "section_review": {{
                "Summary": "string review of summary section",
                "Experience": "string review of experience section",
                "Education": "string review of education section"
            }},
            "ats_score": "integer out of 100",
            "ats_reasoning": "string reasoning for ATS score"
        }}
        
        Resume: pdf_file
        Job Description: {job_description}
        """
    else:  # ATS Optimization
        prompt = f"""
        You are ResumeChecker, an expert in ATS optimization. Analyze the resume in JSON format:
        {{
            "missing_keywords": ["string", "string", "string"],
            "ats_friendly_formatting": "string suggesting ATS-friendly formatting",
            "keyword_optimizations": ["string", "string", "string"],
            "job_specific_suggestions": ["string", "string", "string", "string", "string"],
            "ats_compatibility_score": "integer out of 100"
        }}
        
        Resume: pdf_file
        Job Description: {job_description}
        """
    
    # Get AI response
    response_text = get_gemini_output(file_path, prompt,analysis_option)
    
    # Clean up file after processing
    os.unlink(file_path)
    print(response_text)
    
    return response_text.model_dump()

@app.get("/")
async def root():
    return {"message": "Resume ATS Score Analyzer API is running. Use /score endpoint to analyze resumes."}

if __name__ == "__main__":
    import uvicorn
    import json # Import json
    from pydantic import ValidationError # Import ValidationError
    uvicorn.run(app, host="0.0.0.0", port=8000)