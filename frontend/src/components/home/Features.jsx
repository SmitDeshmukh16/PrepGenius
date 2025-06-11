
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import image1 from '../../images/image1.jpg';
import image2 from '../../images/image2.jpg';
import image3 from '../../images/image3.jpg';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../utils/translations';

const features = [
  {
    title: 'PlacementCalendar',
    description: 'Stay updated with the latest placement schedules and never miss an opportunity.',
    image: image1
  },
  {
    title: 'DSASheet',
    description: 'Access a comprehensive DSA sheet to prepare effectively for coding interviews.',
    image: image2
  },
  {
    title: 'Sessions',
    description: 'Join interactive sessions with industry experts to gain insights and enhance your skills.',
    image: image3
  }
];

function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { language } = useLanguage();
  const t = translations[language].features;

  return (
    <section ref={ref} className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group relative overflow-hidden rounded-2xl"
            >
              <div className="relative h-80 w-full overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
              
              <div className="absolute bottom-0 p-6 w-full">
                <h3 className="text-2xl font-bold mb-2">{t[feature.title]}</h3>
                <p className="text-gray-300">{t[feature.description]}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
