import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, Loader } from 'lucide-react';
import ReactMarkdown from "react-markdown";

function YoutubeLearn() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [summary, setSummary] = useState('');
  const [question, setQuestion] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    const id = extractVideoId(videoUrl);
    if (!id) {
      toast.error('Invalid YouTube URL');
      return;
    }

    setVideoId(id);
    setIsLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/youtube/summary', {
        url: videoUrl
      });

      setSessionId(response.data.session_id);
      setSummary(response.data.summary);
      setMessages([
        {
          type: 'system',
          content: response.data.summary
        }
      ]);
      toast.success('Video analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing video:', error);
      toast.error('Failed to analyze video');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !sessionId) return;

    const newMessage = { type: 'user', content: question };
    setMessages(prev => [...prev, newMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/youtube/ask', {
        session_id: sessionId,
        question: question
      });

      setMessages(prev => [...prev, {
        type: 'system',
        content: response.data.answer
      }]);
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Failed to get answer');
      setMessages(prev => [...prev, {
        type: 'system',
        content: 'Sorry, I encountered an error processing your question.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        YouTube Learn
      </motion.h1>

      <div className="flex gap-8 h-[calc(100vh-12rem)]">
        {/* Video Section (70%) */}
        <div className="w-[70%] flex flex-col gap-4">
          <form onSubmit={handleUrlSubmit} className="flex gap-4">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter YouTube video URL"
              className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600"
            >
              Analyze
            </button>
          </form>

          {videoId && (
            <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>

        {/* Chat Section (30%) */}
        <div className="w-[30%] bg-gray-800 rounded-xl p-4 flex flex-col">
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto mb-4 space-y-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg whitespace-pre-wrap ${
                  message.type === "user"
                    ? "bg-blue-600 ml-auto text-white"
                    : "bg-gray-700 text-white"
                } max-w-[80%] prose prose-invert`}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-center">
                <Loader className="w-6 h-6 animate-spin" />
              </div>
            )}
          </div>

          <form onSubmit={handleQuestionSubmit} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the video..."
              className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!sessionId || isLoading}
            />
            <button
              type="submit"
              disabled={!sessionId || isLoading}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default YoutubeLearn;