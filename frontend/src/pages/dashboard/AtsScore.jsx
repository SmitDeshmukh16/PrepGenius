import { motion } from "framer-motion";
import { useState, useEffect } from "react"; // Import useEffect
import { FileText, Upload, AlertCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

function AtsScore() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisOption, setAnalysisOption] = useState("Quick Scan");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Add useEffect to reset result when analysisOption changes
  useEffect(() => {
    setResult(null); // Clear previous results when analysis option changes
    setError(null); // Clear any previous errors
  }, [analysisOption]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        // 5MB
        toast.error("File size should be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please upload a resume");
      return;
    }

    setIsLoading(true);
    setResult(null); // Clear result before new submission
    setError(null);

    try {
      // const token = localStorage.getItem('token'); // Uncomment if you have authentication
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("job_description", jobDescription);
      formData.append("analysis_option", analysisOption);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/ats/score",
        formData,
        {
          headers: {
            // 'Authorization': `Bearer ${token}`, // Uncomment if you have authentication
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
      toast.success("Resume analyzed successfully");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setError(error.response?.data?.detail || "Failed to analyze resume");
      toast.error("Failed to analyze resume");
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null; // Ensure result exists

    switch (analysisOption) {
      case "Quick Scan":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Quick Scan Results</h3>
            <p>
              <strong>Most Suitable Profession:</strong>{" "}
              {result.most_suitable_profession}
            </p>
            <div>
              <p className="font-semibold">Strengths:</p>
              <ul className="list-disc list-inside ml-4">
                {result.strengths &&
                  result.strengths.map(
                    (
                      s,
                      i // Add null/undefined check
                    ) => <li key={i}>{s}</li>
                  )}
              </ul>
            </div>
            <div>
              <p className="font-semibold">Improvements:</p>
              <ul className="list-disc list-inside ml-4">
                {result.improvements &&
                  result.improvements.map(
                    (
                      im,
                      i // Add null/undefined check
                    ) => <li key={i}>{im}</li>
                  )}
              </ul>
            </div>
            <p className="text-2xl font-bold">
              ATS Score: {result.ats_score}/100
            </p>
          </div>
        );
      case "Detailed Analysis":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Detailed Analysis Results</h3>
            <p>
              <strong>Most Suitable Profession:</strong>{" "}
              {result.most_suitable_profession}
            </p>
            <div>
              <p className="font-semibold">Strengths:</p>
              <ul className="list-disc list-inside ml-4">
                {result.strengths &&
                  result.strengths.map(
                    (
                      s,
                      i // Add null/undefined check
                    ) => <li key={i}>{s}</li>
                  )}
              </ul>
            </div>
            <div>
              <p className="font-semibold">Improvements:</p>
              <ul className="list-disc list-inside ml-4">
                {result.improvements &&
                  result.improvements.map(
                    (
                      im,
                      i // Add null/undefined check
                    ) => <li key={i}>{im}</li>
                  )}
              </ul>
            </div>
            <div>
              <p className="font-semibold">Ratings (out of 10):</p>
              <ul className="list-disc list-inside ml-4">
                {result.ratings &&
                  Object.entries(result.ratings).map(
                    (
                      [key, value] // Add null/undefined check
                    ) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    )
                  )}
              </ul>
            </div>
            <div>
              <p className="font-semibold">Section Review:</p>
              <ul className="list-disc list-inside ml-4">
                {result.section_review &&
                  Object.entries(result.section_review).map(
                    (
                      [key, value] // Add null/undefined check
                    ) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    )
                  )}
              </ul>
            </div>
            <p className="text-2xl font-bold">
              ATS Score: {result.ats_score}/100
            </p>
            <p>
              <strong>Reasoning:</strong> {result.ats_reasoning}
            </p>
          </div>
        );
      case "ATS Optimization":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">ATS Optimization Results</h3>
            <div>
              <p className="font-semibold">Missing Keywords:</p>
              <ul className="list-disc list-inside ml-4">
                {result.missing_keywords &&
                  result.missing_keywords.map(
                    (
                      mk,
                      i // Add null/undefined check
                    ) => <li key={i}>{mk}</li>
                  )}
              </ul>
            </div>
            <p>
              <strong>ATS-Friendly Formatting:</strong>{" "}
              {result.ats_friendly_formatting}
            </p>
            <div>
              <p className="font-semibold">Keyword Optimizations:</p>
              <ul className="list-disc list-inside ml-4">
                {result.keyword_optimizations &&
                  result.keyword_optimizations.map(
                    (
                      ko,
                      i // Add null/undefined check
                    ) => <li key={i}>{ko}</li>
                  )}
              </ul>
            </div>
            <div>
              <p className="font-semibold">Job-Specific Suggestions:</p>
              <ul className="list-disc list-inside ml-4">
                {result.job_specific_suggestions &&
                  result.job_specific_suggestions.map(
                    (
                      js,
                      i // Add null/undefined check
                    ) => <li key={i}>{js}</li>
                  )}
              </ul>
            </div>
            <p className="text-2xl font-bold">
              ATS Compatibility Score: {result.ats_compatibility_score}/100
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        ATS Score Analyzer
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h2 className="text-2xl font-semibold mb-6">Upload Your Resume</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Upload Resume (PDF only)
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PDF (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-400 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {fileName}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Job Description (optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here for better analysis"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Choose Analysis Type:
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="analysis_option"
                    value="Quick Scan"
                    checked={analysisOption === "Quick Scan"}
                    onChange={(e) => setAnalysisOption(e.target.value)}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span>Quick Scan</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="analysis_option"
                    value="Detailed Analysis"
                    checked={analysisOption === "Detailed Analysis"}
                    onChange={(e) => setAnalysisOption(e.target.value)}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span>Detailed Analysis</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="analysis_option"
                    value="ATS Optimization"
                    checked={analysisOption === "ATS Optimization"}
                    onChange={(e) => setAnalysisOption(e.target.value)}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span>ATS Optimization</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 transition-colors"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                "Analyze Resume"
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h2 className="text-2xl font-semibold mb-6">Analysis Results</h2>

          {!result && !error && !isLoading && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FileText className="w-16 h-16 mb-4" />
              <p className="text-lg">
                Upload your resume to see the analysis results
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg">Analyzing your resume...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-500">
                  Analysis Failed
                </h3>
                <p className="text-gray-300">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="prose prose-invert max-w-none">
              {renderResult()}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default AtsScore;
