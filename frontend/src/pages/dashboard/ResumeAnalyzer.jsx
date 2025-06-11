import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FileText, Upload, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [jobDescription, setJobDescription] = useState("");
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    company: "",
    ssc: "",
    hsc: "",
    cgpa: "",
    branch: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const branches = ["IT", "CE", "ENTC", "ECE", "AIDS"];

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/resume/companies",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to fetch companies");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

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
    setResult(null);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("resume", file);
      formDataToSend.append("company", formData.company);
      formDataToSend.append("ssc", formData.ssc);
      formDataToSend.append("hsc", formData.hsc);
      formDataToSend.append("cgpa", formData.cgpa);
      formDataToSend.append("branch", formData.branch);
      formDataToSend.append("job_description", jobDescription);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/resume/analyze",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
      toast.success("Resume analyzed successfully");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setError(error.response?.data?.error || "Failed to analyze resume");
      toast.error("Failed to analyze resume");
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
        Resume Analyzer
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
                Company
              </label>
              <select
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Company</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  10th Percentage
                </label>
                <input
                  type="number"
                  name="ssc"
                  value={formData.ssc}
                  onChange={handleInputChange}
                  placeholder="Enter your 10th percentage"
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  12th Percentage
                </label>
                <input
                  type="number"
                  name="hsc"
                  value={formData.hsc}
                  onChange={handleInputChange}
                  placeholder="Enter your 12th percentage"
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  CGPA
                </label>
                <input
                  type="number"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleInputChange}
                  placeholder="Enter your CGPA"
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  max="10"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Branch
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Job Description (Optional)
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
            <div className="space-y-6">
              <div
                className={`p-4 rounded-lg flex items-start ${
                  result.eligibility?.trim().toLowerCase() === "eligible"
                    ? "bg-blue-900/20 border border-blue-500"
                    : "bg-red-900/20 border border-red-500"
                }`}
              >
                {result.eligibility?.trim().toLowerCase() === "eligible" ? (
                  <CheckCircle className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      result.eligibility?.trim().toLowerCase() === "eligible"
                        ? "text-blue-500"
                        : "text-red-500"
                    }`}
                  >
                    {result.eligibility}
                  </h3>
                  <p className="text-gray-300">
                    {result.eligibility?.trim().toLowerCase() === "eligible"
                      ? "You meet the requirements for this company."
                      : "You do not meet all requirements for this company."}
                  </p>
                </div>
              </div>

              {result.skills && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Skills Detected
                  </h3>

                  {Object.entries(result.skills).map(([category, skills]) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-blue-300 capitalize mb-1">
                        {category.replace("_", " ")}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.missing_skills && result.missing_skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-yellow-500">
                    Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-gray-400 text-sm">
                    Consider developing these skills to improve your chances.
                  </p>
                </div>
              )}

              {result.experience_domains && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Experience Domains
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.experience_domains.map((domain, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.academic_details && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Academic Details
                  </h3>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    {Object.entries(result.academic_details).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between py-1">
                          <span className="text-gray-400">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default ResumeAnalyzer;
