import os
import logging
import yaml
import fitz  # PyMuPDF
import pandas as pd
import re
import json
import nltk
from google import genai
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from google.genai import types
from dotenv import load_dotenv
from pydantic import BaseModel, Field # Import Field for better type hinting if needed

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get the backend directory dynamically
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(script_dir, "..", "..", "..")

# Set the working directory to backend
os.chdir(backend_dir)

# Download NLTK data if not already present
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find("corpora/stopwords")
except LookupError:
    nltk.download('stopwords')

# Configure Gemini API client


# def configure_gemini_api() -> genai.Client:
#     api_key = os.getenv('Test_API_KEY')  # Use the environment variable for the API key
#     if not api_key:
#         raise ValueError("Missing Gemini API key. Please set the GEMINI_API_KEY environment variable.")
#     return genai.Client(api_key=api_key)
gemini_client = genai.Client(api_key="AIzaSyC92l4GjeNVs8yZlv2VyDWB5ZikggNxJCY")
# FastAPI App Setup
app = FastAPI(title="Resume Analyzer",
              description="API for analyzing resumes and checking company eligibility")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for the Gemini response schema
class Skills(BaseModel):
    technical: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    domain_knowledge: List[str] = Field(default_factory=list)

class AcademicDetails(BaseModel):
    degree: str = ""
    institution: str = ""
    graduation_year: str = ""

class ResumeAnalysisResponse(BaseModel):
    skills: Skills = Field(default_factory=Skills)
    experience_domains: List[str] = Field(default_factory=list)
    academic_details: AcademicDetails = Field(default_factory=AcademicDetails)


# Pydantic model for manual eligibility check
class EligibilityRequest(BaseModel):
    company_name: str
    cgpa: float
    hsc: float
    ssc: float
    branch: str
    skills: List[str] # This model is for request, not for the AI's output

# Load company data
COMPANY_DATA_FILE = os.path.join(
    "src", "features", "resume_analyzer", "company_data.csv")

UPLOAD_FOLDER = os.path.join(
    "src", "features", "resume_analyzer", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

CONFIG = os.path.join(
    "src", "features", "resume_analyzer", "config.yaml")


def load_config(config_path: str = CONFIG) -> dict:
    try:
        with open(config_path, 'r') as file:
            return yaml.safe_load(file)
    except FileNotFoundError:
        logger.warning(f"Configuration file not found: {config_path}. Using default model.")
        return {"MODEL": "gemini-1.5-pro"}
    except yaml.YAMLError as e:
        logger.error(f"YAML configuration error in {config_path}: {e}. Using default model.")
        return {"MODEL": "gemini-1.5-pro"}


def load_company_data(csv_path: str = COMPANY_DATA_FILE) -> pd.DataFrame:
    current_directory = os.getcwd()
    print("Current Working Directory:", current_directory)
    try:
        return pd.read_csv(csv_path)
    except FileNotFoundError:
        logger.error(f"Company data file not found: {csv_path}")
        return pd.DataFrame(columns=["Company Name", "Skills Required", "CGPA", "HSC", "SSC", "Branch"])
    except Exception as e:
        logger.error(f"Error loading company data from {csv_path}: {e}")
        return pd.DataFrame(columns=["Company Name", "Skills Required", "CGPA", "HSC", "SSC", "Branch"])


def extract_pdf_text(file_path: str) -> str:
    try:
        doc = fitz.open(file_path)
        text = " ".join(page.get_text() for page in doc)
        doc.close()
        return text
    except Exception as e:
        logger.error(f"PDF extraction error for {file_path}: {e}")
        return ""


def parse_resume(text: str, client: genai.Client) -> ResumeAnalysisResponse:
    try:
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash") 

        prompt = f"""
        Analyze this resume text and extract the following information:
        1.  **Skills**: Categorize into technical, soft skills, and domain knowledge.
        2.  **Experience Domains**: List distinct areas or industries the candidate has worked in.
        3.  **Academic Details**: Extract degree, institution, and graduation year.

        Ensure the output strictly adheres to the provided JSON schema. Do not include any conversational text or formatting outside the JSON object.

        Resume Text:
        {text}
        """
        # The response_schema will guide the model to output the correct structure
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.3,response_mime_type="application/json",response_schema=ResumeAnalysisResponse)
            
        )

        # Access the parsed Pydantic object directly
        parsed_response = response.parsed
        if parsed_response is None:
            logger.error(f"Gemini returned an unparsable response or non-schema compliant output for resume parsing. Raw response: {response.text}")
            # Return a default empty object instead of raising error for robustness
            return ResumeAnalysisResponse()
        
        # If response.parsed is not None, it's already an instance of ResumeAnalysisResponse
        return parsed_response

    except Exception as e:
        logger.error(f"Resume parsing error with Gemini API: {e}")
        # Return a default empty object in case of an overall error
        return ResumeAnalysisResponse()


# Check missing skills against required ones
def check_skills_match(candidate_skills: List[str], required_skills: str) -> List[str]:
    if not required_skills or pd.isna(required_skills):
        return []
    required_skills_list = [skill.strip().lower()
                            for skill in required_skills.split(',')]
    candidate_skills_lower = [skill.lower() for skill in candidate_skills]
    return [skill for skill in required_skills_list if skill not in candidate_skills_lower]

# Check eligibility based on academic criteria
def check_eligibility(company_row, cgpa, hsc, ssc, branch):
    eligible = True
    reasons = []

    # Check CGPA
    if 'CGPA' in company_row and pd.notna(company_row['CGPA']) and float(company_row['CGPA']) > 0:
        if float(cgpa) < float(company_row['CGPA']):
            eligible = False
            reasons.append(
                f"CGPA requirement not met: {cgpa} < {company_row['CGPA']}")

    # Check HSC
    if 'HSC' in company_row and pd.notna(company_row['HSC']) and float(company_row['HSC']) > 0:
        if float(hsc) < float(company_row['HSC']):
            eligible = False
            reasons.append(
                f"12th percentage requirement not met: {hsc} < {company_row['HSC']}")

    # Check SSC
    if 'SSC' in company_row and pd.notna(company_row['SSC']) and float(company_row['SSC']) > 0:
        if float(ssc) < float(company_row['SSC']):
            eligible = False
            reasons.append(
                f"10th percentage requirement not met: {ssc} < {company_row['SSC']}")

    # Check Branch
    if 'Branch' in company_row and pd.notna(company_row['Branch']) and company_row['Branch']:
        eligible_branches = [b.strip()
                             for b in str(company_row['Branch']).split(',')]
        if branch and branch not in eligible_branches and eligible_branches != ['']:
            eligible = False
            reasons.append(
                f"Branch {branch} not in eligible branches: {', '.join(eligible_branches)}")

    return eligible, reasons


# @app.on_event("startup")
# async def startup_event():
#     global gemini_client
#     try:
#         gemini_client = configure_gemini_api()
#         logger.info("Gemini API client initialized successfully.")
#     except ValueError as e:
#         logger.critical(f"Failed to initialize Gemini API: {e}")
#         # Depending on criticality, you might want to exit or disable AI features
#         raise

@app.post("/analyze", response_model=ResumeAnalysisResponse) # Indicate the expected response model
async def analyze_resume(
    resume: UploadFile = File(...),
    company: Optional[str] = Form(None),
    cgpa: Optional[float] = Form(None),
    hsc: Optional[float] = Form(None),
    ssc: Optional[float] = Form(None),
    branch: Optional[str] = Form(None)
):
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini API not initialized.")

    file_path = None # Initialize file_path
    try:
        # Save uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, resume.filename)
        with open(file_path, "wb") as f:
            f.write(await resume.read())

        # Extract text from PDF
        cv_text = extract_pdf_text(file_path)
        if not cv_text:
            raise HTTPException(
                status_code=400,
                detail="Failed to extract text from resume. Please ensure it's a valid PDF."
            )

        # Load configuration
        

        # Parse resume using Gemini and get a Pydantic object
        extracted_data: ResumeAnalysisResponse = parse_resume(cv_text, gemini_client)
        
        # Prepare base response data using the Pydantic object's attributes
        response_data = extracted_data.model_dump() # Convert Pydantic object to dict

        # If company is provided, check eligibility
        if company and cgpa is not None and hsc is not None and ssc is not None and branch:
            # Load company data
            df = load_company_data()

            # Check if company exists
            company_row = df[df["Company Name"] == company]
            if not company_row.empty:
                company_data = company_row.iloc[0].to_dict()

                # Check missing skills - now access from extracted_data.skills
                all_candidate_skills = (
                    extracted_data.skills.technical +
                    extracted_data.skills.soft_skills +
                    extracted_data.skills.domain_knowledge
                )
                required_skills = company_data.get("Skills Required", "")
                missing_skills = check_skills_match(all_candidate_skills, required_skills)

                # Check eligibility based on academic criteria
                eligible, reasons = check_eligibility(
                    company_data, cgpa, hsc, ssc, branch)

                # Add eligibility info to response
                response_data.update({
                    "eligibility": "Eligible" if eligible else "Not Eligible",
                    "missing_skills": missing_skills,
                    "reasons": reasons if not eligible else []
                })
            else:
                response_data.update({
                    "eligibility": "Company not found",
                    "missing_skills": [],
                    "reasons": ["Company not found in our database."]
                })
        
        # Clean up file
        os.unlink(file_path)
        print(response_data)

        return response_data # FastAPI will serialize this dictionary to JSON based on response_model

    except HTTPException: # Re-raise FastAPI HTTPExceptions
        raise
    except Exception as e:
        logger.error(f"Resume analysis failed: {e}", exc_info=True)
        # Clean up file if it exists and an error occurred
        if file_path and os.path.exists(file_path):
            os.unlink(file_path)
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred during resume analysis: {str(e)}"
        )


@app.get("/companies")
async def get_companies():
    try:
        df = load_company_data()
        companies = df["Company Name"].tolist()
        return JSONResponse(content={"success": True, "companies": companies})
    except Exception as e:
        logger.error(f"Get companies error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve companies: {str(e)}"
        )


@app.get("/company/{company_name}")
async def get_company_requirements(company_name: str):
    try:
        df = load_company_data()
        company_row = df[df["Company Name"] == company_name]
        if company_row.empty:
            raise HTTPException(
                status_code=404,
                detail="Company not found"
            )

        company_data = company_row.iloc[0].to_dict()

        skills_required = []
        if "Skills Required" in company_data and pd.notna(company_data["Skills Required"]):
            skills_required = [
                skill.strip() for skill in company_data["Skills Required"].split(',')]

        eligible_branches = []
        if "Branch" in company_data and pd.notna(company_data["Branch"]):
            eligible_branches = [branch.strip() for branch in str(
                company_data["Branch"]).split(',')]

        requirements = {
            "company_name": company_name,
            "skills_required": skills_required,
            "cgpa": company_data.get("CGPA", 0) if pd.notna(company_data.get("CGPA", 0)) else 0,
            "hsc": company_data.get("HSC", 0) if pd.notna(company_data.get("HSC", 0)) else 0,
            "ssc": company_data.get("SSC", 0) if pd.notna(company_data.get("SSC", 0)) else 0,
            "eligible_branches": eligible_branches
        }

        return JSONResponse(content={"success": True, "requirements": requirements})

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get company requirements error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve company requirements: {str(e)}"
        )


@app.get("/")
async def root():
    return {"message": "Resume Analyzer API is running", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)