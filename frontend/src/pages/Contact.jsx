import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

function Contact() {
  const { language } = useLanguage();
  const t = translations[language].contact;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-16"
        >
          {t.title}
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center space-x-4">
              <MapPin className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-xl font-semibold">Address</h3>
                <p className="text-gray-300">PICT, Pune, Maharashtra</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Phone className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-xl font-semibold">Phone</h3>
                <p className="text-gray-300">+91 1234567890</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Mail className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-xl font-semibold">Email</h3>
                <p className="text-gray-300">info@prepGenius.com</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.form.name}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.form.email}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.form.message}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-800 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send size={20} />
                {t.form.submit}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Contact;