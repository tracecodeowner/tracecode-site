import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function SupportButton() {
  return (
    <motion.a
      href="https://t.me/paypalsupporrttt"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring' }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-accent text-background font-bold text-xs shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-shadow"
    >
      <MessageCircle className="w-4 h-4" />
      <span className="hidden sm:inline">Support</span>
      <motion.span
        className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
    </motion.a>
  );
}