import axios from "axios";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("email"); // email, otp, or password
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setStep("otp");
      toast.success("OTP sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });
      setStep("password");
      toast.success("OTP verified successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", { email, otp, newPassword });
      toast.success("Password reset successful");
      setStep("success");
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed");
    }
  };

  const renderStep = () => {
    switch (step) {
      case "email":
        return (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-6 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-4 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
            >
              Send OTP
            </button>
          </form>
        );

      case "otp":
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-6 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-4 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
            >
              Verify OTP
            </button>
          </form>
        );

      case "password":
        return (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full px-6 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute inset-y-0 right-4 flex items-center"
              >
                {showNewPassword ? (
                  <EyeOff className="w-6 h-6 text-gray-500" />
                ) : (
                  <Eye className="w-6 h-6 text-gray-500" />
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full px-6 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-4 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-6 h-6 text-gray-500" />
                ) : (
                  <Eye className="w-6 h-6 text-gray-500" />
                )}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-4 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
            >
              Reset Password
            </button>
          </form>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="text-blue-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Password Reset Successful</h3>
            <p className="text-gray-600">You can now login with your new password.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] shadow-xl max-w-3xl w-full p-8"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Reset Password</h2>
        {renderStep()}
        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-500 text-sm">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
