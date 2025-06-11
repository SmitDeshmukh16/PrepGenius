import axios from "axios";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../utils/translations";

function Signup() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].signup;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] shadow-xl overflow-hidden max-w-3xl w-full flex"
      >
        <div className="hidden md:block w-1/2 bg-blue-900 p-8 text-white rounded-l-[2rem]">
          <div className="h-full flex flex-col justify-center items-center text-center">
            <h2 className="text-4xl font-bold mb-6">{t.alreadySigned}</h2>
            <p className="text-lg mb-12">{t.enterDetails}</p>
            <Link
              to="/login"
              className="inline-block border-2 border-white text-white px-12 py-4 rounded-xl hover:bg-white hover:text-emerald-500 transition-colors text-center font-semibold"
            >
              {t.signInButton}
            </Link>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{t.title}</h2>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                {t.orUseEmail}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="name"
                placeholder={t.namePlaceholder}
                value={formData.name}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-900 placeholder-gray-800"
                required
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder={t.emailPlaceholder}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-900 placeholder-gray-800"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t.passwordPlaceholder}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-900 placeholder-gray-800"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-4 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="w-6 h-6 text-gray-500" />
                ) : (
                  <Eye className="w-6 h-6 text-gray-500" />
                )}
              </button>
            </div>

            <div className="w-full">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-900 placeholder-gray-800"
                required
              >
                <option value="" disabled>
                  Select Role
                </option>
                <option value="farmer">Farmer</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-4 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
            >
              {t.signUpButton}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;
