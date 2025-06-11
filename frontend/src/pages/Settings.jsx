import axios from 'axios';
import { motion } from 'framer-motion';
import { Bell, Globe } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

function Settings() {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language].settings;

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    weatherAlerts: true,
    marketPrices: false,
  });

  const handleNotificationChange = async (setting) => {
    try {
      const token = localStorage.getItem('token');
      const newSettings = {
        ...notifications,
        [setting]: !notifications[setting],
      };
      
      await axios.put(
        'http://localhost:5000/api/user/notifications',
        { notifications: newSettings },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setNotifications(newSettings);
      toast.success(t.settingsSuccess);
    } catch (error) {
      toast.error(t.settingsError);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Notifications Section */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-brand-blue" />
              <h2 className="text-2xl font-bold">{t.notifications}</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-300">{t[key]}</span>
                  <button
                    onClick={() => handleNotificationChange(key)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      value ? 'bg-brand-blue' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Language Section */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-brand-blue" />
              <h2 className="text-2xl font-bold">{t.language}</h2>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">{t.currentLanguage}: {language.toUpperCase()}</span>
              <button
                onClick={toggleLanguage}
                className="px-6 py-2 bg-brand-blue text-black rounded-lg hover:bg-opacity-90 transition-colors"
              >
                {t.switchLanguage}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Settings;
