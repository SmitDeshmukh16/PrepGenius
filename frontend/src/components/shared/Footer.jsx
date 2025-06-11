

import { motion } from 'framer-motion';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import logo from "../../images/logo.png";
import { translations } from '../../utils/translations';

function Footer() {
  const { language } = useLanguage();
  const t = translations[language].footer;

  return (
    <footer className="bg-gradient-to-b from-blue-900 to-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <img
              src={logo}
              alt="Logo"
              className="h-12 mb-6"
            />
            <p className="text-gray-300">
              {t.description}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">{t.quickLinks}</h3>
            <ul className="space-y-2">
              {['Resume Analyser', 'Placement Calendar', 'DSA Sheet'].map((item) => (
                <li key={item}>
                  <motion.a
                    href="#"
                    whileHover={{ x: 5 }}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">{t.contact}</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-300">
                <MapPin className="mr-2" size={20} />
                PICT, Pune
              </li>
              <li className="flex items-center text-gray-300">
                <Phone className="mr-2" size={20} />
                9876543210
              </li>
              <li className="flex items-center text-gray-300">
                <Mail className="mr-2" size={20} />
                info@prepGenius.com
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">{t.followUs}</h3>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ y: -5 }}
                  className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"
                >
                  <Icon size={24} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} PrepGenius. {t.allRightsReserved}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
