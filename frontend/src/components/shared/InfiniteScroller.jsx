import { motion } from 'framer-motion';

function InfiniteScroller({ items }) {
  return (
    <div className="relative flex overflow-x-hidden bg-black/50 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex whitespace-nowrap"
      >
        <div className="animate-scroll-x flex whitespace-nowrap">
          {items.map((item, index) => (
            <motion.span
              key={`${item}-${index}`}
              whileHover={{ scale: 1.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold mx-8 hover:text-brand-blue transition-all duration-300 hover:glow cursor-default"
            >
              {item}
            </motion.span>
          ))}
        </div>
        <div
          className="animate-scroll-x flex whitespace-nowrap"
          aria-hidden="true"
        >
          {items.map((item, index) => (
            <motion.span
              key={`${item}-${index}-duplicate`}
              whileHover={{ scale: 1.1 }}
              className="text-xl sm:text-2xl md:text-3xl font-bold mx-8 hover:text-brand-blue transition-all duration-300 hover:glow cursor-default"
            >
              {item}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default InfiniteScroller;
