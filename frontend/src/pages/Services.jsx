import { motion } from 'framer-motion';
import { Activity, BarChart, Database } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

function Services() {
  const { language } = useLanguage();
  const t = translations[language].services;

  const services = [
    {
      icon: BarChart,
      title: t.prediction.title,
      description: t.prediction.description,
      image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      icon: Activity,
      title: t.monitoring.title,
      description: t.monitoring.description,
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      icon: Database,
      title: t.analytics.title,
      description: t.analytics.description,
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="group relative overflow-hidden rounded-2xl"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors duration-300" />
                <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center">
                  <service.icon className="w-12 h-12 text-blue-500 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                  <p className="text-gray-300">{service.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Services;