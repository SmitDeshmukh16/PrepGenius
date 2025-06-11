
import { motion, useInView } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../utils/translations';

function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { language } = useLanguage();
  const t = translations[language].testimonials; // Access testimonials translations

  return (
    <section ref={ref} className="py-24 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center relative"
        >
          <Quote
            size={48}
            className="absolute -top-12 -left-12 text-blue-500 opacity-50"
          />

          <motion.p
            initial={{ y: 20 }}
            animate={isInView ? { y: 0 } : { y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl sm:text-2xl text-gray-300 leading-relaxed"
          >
            {t.quote}
          </motion.p>

          <Quote
            size={48}
            className="absolute -bottom-12 -right-12 text-blue-500 opacity-50"
          />
        </motion.div>
      </div>
    </section>
  );
}

export default Testimonials;
