import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Play, Pause, StopCircle, Clock, Target, AlertCircle, Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // For tables in PDF

const sampleVideos = [
  {
    title: "Introduction to React",
    url: "https://www.youtube.com/embed/Rh3tobg7hEo"
  },
  {
    title: "JavaScript Basics",
    url: "https://www.youtube.com/embed/W6NZfCO5SIk"
  },
  {
    title: "Python Tutorial",
    url: "https://www.youtube.com/embed/rfscVS0vtbw"
  },
  {
    title: "Web Development",
    url: "https://www.youtube.com/embed/G3e-cpL7ofc"
  },
  {
    title: "Data Structures",
    url: "https://www.youtube.com/embed/RBSGKlAvoiM"
  }
];

function EyeTracking() {
  const [selectedVideo, setSelectedVideo] = useState(sampleVideos[0]);
  const [isTracking, setIsTracking] = useState(false);
  const [attentionData, setAttentionData] = useState(null);
  const [videoStartTime, setVideoStartTime] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionLog, setSessionLog] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const videoRef = useRef(null);
  const buzzerRef = useRef(new Audio('./public/buzzer.mp3'));

  useEffect(() => {
    let attentionInterval;

    const fetchAttentionData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/attention/video');
        const data = response.data;
        console.log(data.status);
        
        if (data.status === 'DISTRACTED') {
          toast.error('You seem distracted!');
          buzzerRef.current.play();
        }
        
        setAttentionData(data);
      } catch (error) {
        console.error('Error fetching attention data:', error);
      }
    };

    if (isTracking) {
      attentionInterval = setInterval(fetchAttentionData, 1000);
    }

    return () => {
      if (attentionInterval) {
        clearInterval(attentionInterval);
      }
    };
  }, [isTracking]);

  const handleStartTracking = async () => {
    try {
      await axios.get('http://127.0.0.1:8000/api/attention/video');
      setIsTracking(true);
      setVideoStartTime(new Date());
      setSessionLog([]);
      setStatistics(null);
      toast.success('Attention tracking started');
    } catch (error) {
      console.error('Error starting tracking:', error);
      toast.error('Failed to start tracking');
    }
  };

  const handleStopTracking = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/attention/stop');
      setIsTracking(false);
      setSessionLog(response.data.session_log);
      setStatistics(response.data.statistics);
      toast.success('Tracking stopped');
    } catch (error) {
      console.error('Error stopping tracking:', error);
      toast.error('Failed to stop tracking');
    }
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } else {
        videoRef.current.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Prepare data for charts
  const attentionChartData = [
    { name: 'Attentive', value: statistics?.attentive_count || 0 },
    { name: 'Distracted', value: statistics?.distracted_count || 0 },
  ];

  const attentionBarData = [
    { name: 'Attentive', count: statistics?.attentive_count || 0 },
    { name: 'Distracted', count: statistics?.distracted_count || 0 },
  ];

  const COLORS = ['#10B981', '#EF4444']; // Green for attentive, red for distracted

  // Function to download report as PDF
  const downloadPDFReport = () => {
    if (!statistics || !sessionLog.length) {
      toast.error('No data available to download');
      return;
    }
  
    // Initialize PDF
    const doc = new jsPDF();
  
    // Add title
    doc.setFontSize(18);
    doc.text('Eye Tracking Session Report', 10, 20);
  
    // Add session statistics
    doc.setFontSize(12);
    doc.text(`Session Duration: ${statistics.total_entries * 10} seconds`, 10, 30);
    doc.text(`Final Score: ${statistics.final_score.toFixed(1)}%`, 10, 40);
    doc.text(`Attentive Count: ${statistics.attentive_count}`, 10, 50);
    doc.text(`Distracted Count: ${statistics.distracted_count}`, 10, 60);
  
    // Add session log as a table
    let yPos = 70;
    doc.setFontSize(14);
    doc.text('Session Log:', 10, yPos);
    yPos += 10;
  
    sessionLog.forEach((log, index) => {
      if (yPos > 280) {
        doc.addPage(); // Add a new page if the content exceeds the page height
        yPos = 20;
      }
      doc.text(`${index + 1}. ${log}`, 10, yPos);
      yPos += 10;
    });
  
    // Save the PDF
    doc.save('eye_tracking_report.pdf');
  };
  return (
    <div className="p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        Eye Tracking
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="aspect-w-16 aspect-h-9 mb-6">
              <iframe
                ref={videoRef}
                width="100%"
                height="500"
                src={`${selectedVideo.url}?enablejsapi=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <button
                  onClick={toggleVideo}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>

              <div className="flex gap-4">
                {!isTracking ? (
                  <button
                    onClick={handleStartTracking}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Start Tracking
                  </button>
                ) : (
                  <button
                    onClick={handleStopTracking}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <StopCircle className="w-5 h-5" />
                    Stop Tracking
                  </button>
                )}
              </div>
            </div>
          </div>

          {statistics && !isTracking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-gray-800 rounded-xl p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Session Report</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Session Duration</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-500">
                    {statistics.total_entries * 10} seconds
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-semibold">Final Score</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-500">
                    {statistics.final_score.toFixed(1)}%
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold">Attention States</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-green-500">Attentive: {statistics.attentive_count}</p>
                    <p className="text-red-500">Distracted: {statistics.distracted_count}</p>
                  </div>
                </div>
              </div>

              {/* Recharts Graphs */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Attention Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-4">Pie Chart</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={attentionChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {attentionChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-4">Bar Chart</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={attentionBarData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Download Report Button */}
              <div className="mt-8">
                <button
                  onClick={downloadPDFReport}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Report (PDF)
                </button>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Session Log</h3>
                <div className="bg-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {sessionLog.map((log, index) => (
                    <div
                      key={index}
                      className={`py-2 px-4 rounded-lg mb-2 ${
                        log.includes('DISTRACTED')
                          ? 'bg-red-900/20 border border-red-500'
                          : log.includes('ATTENTIVE')
                          ? 'bg-green-900/20 border border-green-500'
                          : 'bg-blue-900/20 border border-blue-500'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Video List</h2>
            <div className="space-y-4">
              {sampleVideos.map((video) => (
                <button
                  key={video.url}
                  onClick={() => setSelectedVideo(video)}
                  className={`w-full p-4 rounded-lg transition-colors ${
                    selectedVideo.url === video.url
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {video.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EyeTracking;