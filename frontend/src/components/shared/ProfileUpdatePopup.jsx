import { motion } from 'framer-motion';
import { UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ProfileUpdatePopup({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-2xl max-w-md w-full p-6"
      >
        <div className="flex flex-col items-center text-center">
          <div className="bg-blue-800/20 p-4 rounded-full mb-4">
            <UserCog className="w-8 h-8 text-brand-blue" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Update Your Profile</h2>
          <p className="text-gray-300 mb-6">
            Please complete your profile to get personalized recommendations and better insights.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                onClose();
                navigate('/profile');
              }}
              className="px-6 py-2 bg-brand-blue text-black rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
            >
              Update Profile
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfileUpdatePopup;