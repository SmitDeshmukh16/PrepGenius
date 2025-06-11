import axios from 'axios';
import { motion } from 'framer-motion';
import { Camera, Leaf, Mail, MapPin, Phone, Ruler } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

function Profile() {
  const { language } = useLanguage();
  const t = translations[language].profile;
  const API_BASE_URL = 'http://localhost:5000';

  const [profile, setProfile] = useState({
    name: 'Unnamed User',
    email: 'Email not provided',
    avatar: `${API_BASE_URL}/default-avatar.png`,
    location: '',
    phone: '',
    landArea: '',
    soilType: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  const soilTypes = ['Clay', 'Sandy', 'Silty', 'Peaty', 'Chalky', 'Loamy', 'Other'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          const avatarUrl = response.data.avatar ? `${API_BASE_URL}${response.data.avatar}` : `${API_BASE_URL}/default-avatar.png`;

          setProfile({
            ...response.data,
            avatar: avatarUrl,
          });
          localStorage.setItem('userProfile', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to fetch profile');
      }
    };

    fetchProfile();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('avatar', file);

        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_BASE_URL}/api/user/upload-avatar`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        const newAvatarUrl = `${API_BASE_URL}${response.data.avatarUrl}`;

        setProfile(prev => ({
          ...prev,
          avatar: `${newAvatarUrl}?t=${Date.now()}`,
        }));

        localStorage.setItem('userProfile', JSON.stringify({
          ...profile,
          avatar: response.data.avatarUrl
        }));

        toast.success('Profile picture updated successfully');
      } catch (error) {
        console.error('Error updating avatar:', error);
        toast.error('Failed to update profile picture');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/user/profile`,
        profile,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedProfile = {
        ...response.data,
        avatar: response.data.avatar ? `${API_BASE_URL}${response.data.avatar}` : profile.avatar,
      };

      setProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(response.data));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-8"
        >
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-brand-blue text-black p-2 rounded-full cursor-pointer hover:bg-opacity-90 transition-colors">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <h2 className="mt-4 text-2xl font-bold">{profile.name}</h2>
              <p className="text-gray-400">{profile.email}</p>
            </div>

            <div className="flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {t.location}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:opacity-50"
                        placeholder={t.locationPlaceholder}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {t.phone}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:opacity-50"
                        placeholder={t.phonePlaceholder}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {t.email}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {t.landArea}
                    </label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={profile.landArea}
                        onChange={(e) => setProfile(prev => ({ ...prev, landArea: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:opacity-50"
                        placeholder={t.landAreaPlaceholder}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {t.soilType}
                    </label>
                    <div className="relative">
                      <Leaf className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={profile.soilType}
                        onChange={(e) => setProfile(prev => ({ ...prev, soilType: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:opacity-50"
                      >
                        <option value="">{t.soilTypePlaceholder}</option>
                        {soilTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-lg bg-brand-blue text-black hover:bg-opacity-90 transition-colors"
                      >
                        {t.save}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 rounded-lg bg-brand-blue text-black hover:bg-opacity-90 transition-colors"
                    >
                      {t.edit}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;