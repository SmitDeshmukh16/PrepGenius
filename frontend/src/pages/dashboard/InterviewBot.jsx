import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import { Download, Mic, StopCircle, Video, Loader } from 'lucide-react';

function InterviewBot() {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [report, setReport] = useState(null);
  const [candidateInfo, setCandidateInfo] = useState({
    name: '',
    education: '',
    skills: '',
    position: '',
    experience: '',
    projects: ''
  });
  const [showForm, setShowForm] = useState(true);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const chatContainerRef = useRef(null);
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [webSocket, setWebSocket] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoStreamRef = useRef(null);
  const canvasRef = useRef(null);
  const [showReport, setShowReport] = useState(false);
  
  // Initialize video element and canvas on component mount
  useEffect(() => {
    // Create canvas element if it doesn't exist
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 840;
      canvasRef.current.height = 840;
    }
    
    // Initialize camera if we're in interview mode but not in form or report view
    if (isInterviewStarted && !showForm && !showReport) {
      startVideoStream();
    }
    
    // Cleanup function to handle component unmounting
    return () => {
      if (videoStreamRef.current) {
        stopVideoProcessing();
      }
      
      // Make sure to stop all video streams when component unmounts or changes state
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isInterviewStarted, showForm, showReport]);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, [webSocket]);
  
  const startVideoStream = async () => {
    try {
      // Clear any existing loading state
      setIsLoading(true);
      
      // Make sure the video element exists before proceeding
      if (!videoRef.current) {
        console.error('Video element reference is not available');
        toast.error('Video element not available');
        setIsLoading(false);
        return null;
      }
      
      // First stop any existing streams
      if (videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false // Explicitly specify no audio to prevent conflicts
      });
      
      console.log('Camera access granted, setting up video stream');
      
      // Set the stream to the video element
      videoRef.current.srcObject = stream;
      
      // Force the video to play
      try {
        await videoRef.current.play();
        console.log('Video playback started successfully');
      } catch (e) {
        console.error("Error playing video:", e);
        toast.error('Failed to play video stream');
      }

      // Make sure canvas is initialized
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      canvasRef.current.width = 640;
      canvasRef.current.height = 600;

      // Initialize WebSocket connection if not already connected
      if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
        const ws = new WebSocket('ws://localhost:8000/api/interview/video_stream');
        setWebSocket(ws);

        ws.onopen = () => {
          console.log('WebSocket connection established');
          startVideoProcessing(stream);
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.average_confidence_score) {
            setConfidenceScore(data.average_confidence_score);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          toast.error('WebSocket connection error');
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed');
          stopVideoProcessing();
        };
      } else {
        // If WebSocket already exists, start video processing
        startVideoProcessing(stream);
      }
      
      setIsLoading(false);
      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error(`Failed to access camera: ${error.message}`);
      setIsLoading(false);
      return null;
    }
  };

  const startVideoProcessing = (stream) => {
    if (!stream || !webSocket || !canvasRef.current) {
      console.error('Missing required resources for video processing');
      return;
    }

    const videoTrack = stream.getVideoTracks()[0];
    const settings = videoTrack.getSettings();
    canvasRef.current.width = settings.width || 640;
    canvasRef.current.height = settings.height || 640;
    const ctx = canvasRef.current.getContext('2d');
    
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    
    const sendFrame = () => {
      if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket not open, stopping video processing');
        stopVideoProcessing();
        return;
      }

      ctx.drawImage(videoElement, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.7);
      const base64Data = imageData.split(',')[1];
      
      try {
        webSocket.send(JSON.stringify({ frame: base64Data }));
      } catch (error) {
        console.error('Error sending frame:', error);
      }

      videoStreamRef.current = requestAnimationFrame(sendFrame);
    };

    videoElement.onloadedmetadata = () => {
      videoElement.play().then(() => {
        // Start sending frames only after the video is actually playing
        videoStreamRef.current = requestAnimationFrame(sendFrame);
      }).catch(e => {
        console.error("Error playing processing video:", e);
      });
    };
  };
  
  const stopVideoProcessing = () => {
    if (videoStreamRef.current) {
      cancelAnimationFrame(videoStreamRef.current);
      videoStreamRef.current = null;
    }
  };

  const startInterview = async () => {
    if (!candidateInfo.name || !candidateInfo.education || !candidateInfo.skills || 
        !candidateInfo.position || !candidateInfo.experience || !candidateInfo.projects) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setIsLoading(true);
      
      // First set up the UI state
      setIsInterviewStarted(true);
      setShowForm(false);
      
      const response = await axios.post('http://127.0.0.1:8000/api/interview/start_interview/', candidateInfo);
      setSessionId(response.data.session_id);
      setCurrentQuestion(response.data.question);
      setMessages([{ type: 'bot', content: response.data.question }]);
      setAudioStream(response.data.audio_file_url);
      
      // Now start the video stream after the UI is updated
      await startVideoStream();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error(`Failed to start interview: ${error.message}`);
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      // Request access to the user's microphone (audio only)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });

        const formData = new FormData();
        formData.append("audio_file", audioBlob, "recording.wav");

        try {
          setIsLoading(true);
          console.log("Question_answer");
          const response = await axios.post(
            `http://127.0.0.1:8000/api/interview/answer_question/?session_id=${sessionId}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          setMessages((prev) => [
            ...prev,
            { type: "user", content: "Audio response submitted" },
            { type: "bot", content: response.data.question },
          ]);

          setCurrentQuestion(response.data.question);
          setAudioStream(response.data.audio_file_url);
          setIsLoading(false);

          if (response.data.interview_done) {
            stopInterview();
          }
        } catch (error) {
          console.error("Error submitting answer:", error);
          toast.error("Failed to submit answer");
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const stopInterview = async () => {
    try {
      setIsLoading(true);
      
      // First close the WebSocket connection if open
      if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(JSON.stringify({ close: true }));
        webSocket.close();
        setWebSocket(null);
      }
      
      // Stop video processing
      stopVideoProcessing();

      // Stop all camera tracks
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      // Get the interview results
      const response = await axios.get(`http://127.0.0.1:8000/api/interview/get_results/?session_id=${sessionId}`);
      setReport(response.data);
      
      // Update UI state
      setIsInterviewStarted(false);
      setShowReport(true); // Show the report immediately after ending interview
      
      toast.success('Interview completed');
      setIsLoading(false);
    } catch (error) {
      console.error('Error stopping interview:', error);
      toast.error('Failed to stop interview');
      setIsLoading(false);
    }
  };

  const generateReportHTML = () => {
    if (!report) return '';
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Report - ${candidateInfo.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .report-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #3b82f6;
          }
          .candidate-info {
            background-color: #f1f5f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
          }
          .candidate-info p {
            margin: 5px 0;
          }
          h1 {
            color: #1e40af;
          }
          h2 {
            color: #2563eb;
            margin-top: 30px;
          }
          h3 {
            color: #3b82f6;
          }
          .question-section {
            margin-bottom: 30px;
            padding: 15px;
            border-radius: 5px;
            background-color: #f8fafc;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .score {
            font-weight: bold;
          }
          .feedback {
            margin-top: 5px;
            font-style: italic;
          }
          .confidence-section {
            margin-top: 30px;
            padding: 15px;
            background-color: #eff6ff;
            border-radius: 5px;
          }
          .confidence-bar {
            height: 20px;
            background-color: #dbeafe;
            border-radius: 10px;
            margin: 10px 0;
            overflow: hidden;
          }
          .confidence-fill {
            height: 100%;
            background-color: #3b82f6;
            width: ${confidenceScore ? (confidenceScore / 10) * 100 : 0}%;
          }
          @media print {
            body {
              font-size: 12pt;
            }
            .question-section {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>Interview Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="candidate-info">
          <h2>Candidate Information</h2>
          <p><strong>Name:</strong> ${candidateInfo.name}</p>
          <p><strong>Position:</strong> ${candidateInfo.position}</p>
          <p><strong>Education:</strong> ${candidateInfo.education}</p>
          <p><strong>Experience:</strong> ${candidateInfo.experience}</p>
          <p><strong>Skills:</strong> ${candidateInfo.skills}</p>
        </div>
        
        <h2>Evaluation Results</h2>
        ${Object.entries(report.evaluations).map(([question, evaluation]) => `
          <div class="question-section">
            <h3>Question: ${question}</h3>
            <p><strong>Difficulty Level:</strong> ${evaluation.difficulty_level}</p>
            <p><strong>Answer:</strong> ${evaluation.transcription}</p>
            
            <p class="score"><strong>Correctness Score:</strong> ${evaluation.correctness_score}/10</p>
            <p class="feedback">${evaluation.correctness_feedback}</p>
            
            <p class="score"><strong>Fluency Score:</strong> ${evaluation.fluency_score}/10</p>
            <p class="feedback">${evaluation.fluency_feedback}</p>
            
            <p class="score"><strong>Vocabulary Score:</strong> ${evaluation.vocabulary_score}/10</p>
            <p class="feedback">${evaluation.vocabulary_feedback}</p>
          </div>
        `).join('')}
        
        ${confidenceScore !== null ? `
          <div class="confidence-section">
            <h2>Confidence Assessment</h2>
            <p>Based on video analysis during the interview:</p>
            <div class="confidence-bar">
              <div class="confidence-fill"></div>
            </div>
            <p class="score">Overall Confidence Score: ${confidenceScore.toFixed(1)}/10</p>
          </div>
        ` : ''}
      </body>
      </html>
    `;
  };

const downloadReport = () => {
    if (!report) return;

    const element = document.createElement('div');
    element.innerHTML = generateReportHTML();
    document.body.appendChild(element);

    html2pdf()
        .from(element)
        .save(`interview-report-${candidateInfo.name.replace(/\s+/g, '-')}.pdf`)
        .then(() => {
            document.body.removeChild(element);
            toast.success('PDF report downloaded');
        });
};

  const toggleShowReport = () => {
    setShowReport(!showReport);
  };

  const startNewInterview = () => {
    // Reset state for a new interview
    setShowForm(true);
    setShowReport(false);
    setReport(null);
    setIsInterviewStarted(false);
    setMessages([]);
    setCurrentQuestion('');
    setSessionId(null);
    setConfidenceScore(null);
  };

  return (
    <div className="p-4 min-h-screen bg-gray-900 text-white">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-4"
      >
        Interview Bot
      </motion.h1>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl flex flex-col items-center">
            <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-white font-medium">Processing...</p>
          </div>
        </div>
      )}

      {showForm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-gray-800 rounded-xl p-6"
        >
          <h2 className="text-2xl font-semibold mb-6">Candidate Information</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
              <input
                type="text"
                value={candidateInfo.name}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Education</label>
              <input
                type="text"
                value={candidateInfo.education}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, education: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Skills</label>
              <input
                type="text"
                value={candidateInfo.skills}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, skills: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Position</label>
              <input
                type="text"
                value={candidateInfo.position}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, position: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Experience</label>
              <input
                type="text"
                value={candidateInfo.experience}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, experience: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Projects</label>
              <textarea
                value={candidateInfo.projects}
                onChange={(e) => setCandidateInfo({ ...candidateInfo, projects: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
            </div>
            <button
              type="button"
              onClick={startInterview}
              disabled={isLoading}
              className={`w-full px-4 py-2 bg-blue-600 text-white rounded-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} transition-colors flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  Start Interview
                </>
              )}
            </button>
          </form>
        </motion.div>
      ) : showReport && report ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white text-black rounded-xl p-6 overflow-auto"
          style={{ maxHeight: "80vh" }}
        >
          <div dangerouslySetInnerHTML={{ __html: generateReportHTML() }} />
          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={startNewInterview}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              New Interview
            </button>
            <button
              onClick={downloadReport}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-120px)]">
          {/* Main chat and video container */}
          <div className="flex flex-1 flex-col relative overflow-hidden">
            {/* Floating video in top right corner */}
            <div className="absolute top-4 right-4 z-10 w-64 shadow-lg rounded-xl overflow-hidden">
              <div className="relative bg-gray-800 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Confidence score overlay on video */}
                {confidenceScore !== null && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-70 p-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(confidenceScore / 10) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-300 text-center">Confidence: {confidenceScore.toFixed(1)}/10</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Chat container (main content) */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 mb-4"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'bot' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-xl p-4 rounded-xl ${
                        message.type === 'bot'
                          ? 'bg-gray-800 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Control bar at bottom */}
            <div className="bg-gray-800 border-t border-gray-700 p-4">
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                {isInterviewStarted ? (
                  <>
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isLoading}
                      className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                        isRecording
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
                    >
                      {isRecording ? (
                        <>
                          <StopCircle className="w-5 h-5" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          Start Recording
                        </>
                      )}
                    </button>
                    <button
                      onClick={stopInterview}
                      disabled={isLoading}
                      className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      End Interview
                    </button>
                  </>
                ) : (
                  <div className="w-full">
                    {report && (
                      <div className="flex flex-col sm:flex-row gap-4 justify-end">
                        <button
                          onClick={toggleShowReport}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View Report
                        </button>
                        <button
                          onClick={downloadReport}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Download Report
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewBot;