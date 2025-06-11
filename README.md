# 🚀 PrepGenius - Your Career Preparation Assistant

## 📝 Description
PrepGenius is a comprehensive career preparation platform designed to revolutionize how job seekers prepare for the job market. It helps candidates optimize their resumes for modern ATS systems, prepare for interviews with AI-generated questions, and enhance their skills through targeted learning resources. Perfect for students, recent graduates, and professionals looking to advance their careers!

## 🛠️ Tech Stack
- **Backend**: 
  - 🐍 FastAPI (Python)
  - 🟢 Node.js & Express
  - 🍃 MongoDB
- **AI Integration**:
  - 🧠 Google Gemini AI
- **Document Processing**:
  - 📄 PyPDF2 (PDF processing)
  - ✅ Pydantic (Data validation)
- **Development Tools**:
  - 🔄 Concurrently (Parallel execution)
  - 🔍 Nodemon (Auto-reload)
- **Authentication**:
  - 🔐 JWT (JSON Web Tokens)

## ✨ Features
- **📊 Resume Analysis**: 
  - Get detailed feedback on your resume
  - Receive actionable improvement suggestions
  - Identify strengths and weaknesses
  
- **🎯 ATS Scoring**: 
  - Evaluate resume compatibility with ATS systems
  - Discover missing keywords
  - Get ATS-friendly formatting suggestions
  - Receive job-specific optimization tips
  
- **❓ MCQ Generation**: 
  - Create practice questions for technical interviews
  - Test your knowledge in your field
  - Prepare with industry-relevant questions
  
- **🤖 Interview Bot**: 
  - Practice with AI-powered interview simulations
  - Receive feedback on your responses
  - Build interview confidence
  
- **📺 YouTube Learning**: 
  - Extract transcripts from educational videos
  - Focus on relevant learning content
  
- **🔒 Authentication**: 
  - Secure user authentication
  - Social login options (GitHub, LinkedIn)
  - Personalized user experience

## 🔧 Installation

### Prerequisites
- 🐍 Python 3.11+ 
- 🟢 Node.js (v14+)
- 📦 npm or yarn
- 💻 Windows, macOS, or Linux

### Setup Steps

1. **📥 Clone the repository**
   ```bash
   git clone <repository-url>
   cd PrepGenius
   ```

2. **🏃‍♂️ Run the automated setup script (Recommended)**
   ```bash
   cd backend
   bash setup.sh
   ```

   This script will:
   - ✅ Create a Python virtual environment
   - 📚 Install Python dependencies
   - 📦 Install Node.js dependencies
   - 🚀 Start the backend services

3. **🔨 Manual setup (Alternative)**
   ```bash
   # Create Python virtual environment
   python3.11 -m venv backend/src/features/env
   
   # Activate virtual environment (Windows)
   backend/src/features/env/Scripts/activate
   # OR (Linux/macOS)
   source backend/src/features/env/bin/activate
   
   # Install Python dependencies
   pip install -r backend/src/features/requirements.txt
   
   # Install Node.js dependencies
   cd backend
   npm install
   ```

## 🚀 Usage

### 🏁 Starting the Application
```bash
cd backend
npm run setup
```

This command will:
- 🐍 Activate the Python virtual environment
- 🟢 Start the Node.js server
- 🚀 Start the FastAPI server with auto-reload enabled

### 🌐 Accessing the Application
- Backend API will be available at: `http://localhost:5000`
- The root endpoint (`/`) provides an overview of available features

### 🔌 API Endpoints
- **Resume Analysis**: `/api/resume/analyze` - Upload and analyze your resume
- **ATS Scoring**: `/api/ats/score` - Check how your resume performs against ATS systems
- **MCQ Generation**: `/api/mcq` - Generate practice questions
- **Interview Bot**: `/api/interview` - Practice interview scenarios
- **YouTube Learning**: `/api/youtube` - Extract learning content from videos

## 📁 Project Structure
```
PrepGenius/
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📁 features/
│   │   │   ├── 📁 ats_score/        # ATS scoring functionality
│   │   │   ├── 📁 interview_bot/    # Interview simulation
│   │   │   ├── 📁 mcq/              # MCQ generation
│   │   │   ├── 📁 resume_analyzer/  # Resume analysis
│   │   │   │   └── 📁 uploads/      # Temporary storage for uploaded resumes
│   │   │   ├── 📁 youtube_transcript/ # YouTube learning
│   │   │   └── 📄 main.py           # FastAPI main entry point
│   │   └── 📄 index.js              # Node.js server entry point
│   ├── 📄 package.json              # Node.js dependencies
│   └── 📄 setup.sh                  # Setup script
├── 📁 frontend/                     # Frontend code (React/Next.js)
```

## 🔐 Environment Variables
Create a `.env` file in the backend directory with the following variables:

```
# 🧠 Google Gemini AI
Test_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model_name  # e.g., gemini-pro-vision

# 🍃 MongoDB
MONGODB_URI=your_mongodb_connection_string

# 🔐 JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=30d

# 📧 Email (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

## 🚨 Troubleshooting
- **Python environment issues**: Make sure you're using Python 3.11+
  ```bash
  python --version
  ```
- **Dependency errors**: Try reinstalling dependencies
  ```bash
  pip install -r backend/src/features/requirements.txt --force-reinstall
  ```
- **Port conflicts**: Check if port 8000 is already in use
  ```bash
  # Linux/macOS
  lsof -i :8000
  # Windows
  netstat -ano | findstr :8000
  ```

## 🔄 Development Workflow
1. Start the application with auto-reload:
   ```bash
   npm run dev
   ```

## 🤝 Contributing
Contributions are welcome! Please follow these steps:

1. 🍴 Fork the repository
2. 🌿 Create your feature branch: `git checkout -b feature/amazing-feature`
3. 💻 Implement your changes and add tests if applicable
4. 📝 Commit your changes: `git commit -m 'Add some amazing feature'`
5. 🚀 Push to the branch: `git push origin feature/amazing-feature`
6. 🔍 Submit a pull request
7. 🎉 Get your contribution merged

## 📊 Future Roadmap
- 📱 Mobile app development
- 🌐 Enhanced multilingual support
- 🎙️ Voice-based interview practice
- 📈 Career path recommendations
- 🧩 Integration with job boards

## 👏 Acknowledgements
- Google Gemini AI for powering the intelligent features
- FastAPI framework for efficient backend development
- All open-source contributors and libraries that made this project possible

## 📞 Contact
For questions or support, please reach out to the project maintainers or open an issue on GitHub.

---

Made with ❤️ by the PrepGenius Team
