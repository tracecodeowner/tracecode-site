import { motion } from 'framer-motion';

import { PROFILE_LIST } from '@/lib/aamva';

export default function ProfileSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground tracking-widest mr-1">PROFILE</span>
      {PROFILE_LIST.map((profile) => {
        const active = profile.key === value;
        return (
          <button
            key={profile.key}
            onClick={() => onChange(profile.key)}
            className={`relative px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all border ${
              active
                ? 'bg-accent/10 text-accent border-accent/40'
                : 'bg-secondary/50 text-muted-foreground border-border hover:border-accent/30'
            }`}
          >
            {active && (
              <motion.div
                layoutId="profile-active"
                className="absolute inset-0 rounded-lg bg-accent/10 border border-accent/30 -z-10"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            {profile.name}
          </button>
        );
      })}
    </div>
  );
}