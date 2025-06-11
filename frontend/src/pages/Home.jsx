import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import About from '../components/home/About';
import Testimonials from '../components/home/Testimonials';
import CallToAction from '../components/home/CallToAction';
import InfiniteScroller from '../components/shared/InfiniteScroller';

const scrollItems = [
  'DSA SHEET',
  'SESSIONS',
  'INTERVIEW BOT',
  'ATS STORE',
  'RESUME ANALYSIS',
  'MCQ GENERATOR',
  'ATTENTION TRACKER',
  'YOUTUBE TRANSRIPT',
  'PLACEMENT CALENDAR',
];

function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden"
    >
      <Hero />
      <InfiniteScroller items={scrollItems} />
      <Features />
      <About />
      <Testimonials />
      <CallToAction />
    </motion.div>
  );
}

export default Home;