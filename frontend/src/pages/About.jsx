import { motion } from 'framer-motion';
import { Eye, Target, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

function About() {
  const { language } = useLanguage();
  const t = translations[language].about;

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 p-8 rounded-2xl"
          >
            <Target className="w-12 h-12 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">{t.mission}</h2>
            <p className="text-gray-300">{t.missionText}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 p-8 rounded-2xl"
          >
            <Eye className="w-12 h-12 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">{t.vision}</h2>
            <p className="text-gray-300">{t.visionText}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800 p-8 rounded-2xl"
          >
            <Users className="w-12 h-12 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">{t.team}</h2>
            <p className="text-gray-300">{t.teamText}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default About;