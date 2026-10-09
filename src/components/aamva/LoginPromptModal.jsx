import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Lock, Zap } from 'lucide-react';

export default function LoginPromptModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-border bg-card overflow-hidden relative"
          >
            <div className="p-6 text-center">
              <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
              <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-accent" />
              </div>
              <div className="text-lg font-bold tracking-tight mb-1">Login to Generate</div>
              <div className="text-xs text-muted-foreground mb-5">
                You need to be logged in with at least 1 credit to generate a barcode. Validation is free.
              </div>
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold tracking-wider"
                >
                  <Zap className="w-4 h-4" />
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground text-center"
                >
                  CREATE ACCOUNT
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}