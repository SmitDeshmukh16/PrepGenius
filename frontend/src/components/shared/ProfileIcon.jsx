import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../utils/translations';
import axios from 'axios';

function ProfileIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].profile;

  useEffect(() => {
    // Fetch profile data when component mounts
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setProfileData(response.data);
        setProfileComplete(!!response.data?.location && !!response.data?.phone);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-800 transition-colors overflow-hidden"
      >
        {profileData?.avatar ? (
          <img
            src={`http://localhost:5000${profileData.avatar}`}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <User className="w-6 h-6" />
        )}
        {!profileComplete && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-lg py-2 z-50"
          >
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="text-sm font-medium">{profileData?.name || 'User'}</p>
              <p className="text-xs text-gray-400">{profileData?.email}</p>
            </div>
            
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 hover:bg-gray-700 transition-colors"
            >
              <User className="w-5 h-5 mr-3" />
              {t.viewProfile}
            </Link>
            <Link
              to="/settings"
              className="flex items-center px-4 py-2 hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5 mr-3" />
              {t.settings}
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 hover:bg-gray-700 transition-colors text-red-400"
            >
              <LogOut className="w-5 h-5 mr-3" />
              {t.logout}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProfileIcon;