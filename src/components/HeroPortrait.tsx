import React from 'react';
import { HeroClass } from '../types';

interface HeroPortraitProps {
  heroClass?: HeroClass;
  emoji?: string;
  name?: string;
  className?: string;
}

export const HeroPortrait: React.FC<HeroPortraitProps> = ({
  heroClass = 'Cavalheiro',
  emoji = '⚔️',
  name = '',
  className = '',
}) => {
  // Renders a high-detail SNES-style bust portrait tailored to the character class
  const renderClassArt = () => {
    switch (heroClass) {
      case 'Cavalheiro':
        // Celes / Edgar style Knight with blonde flowing hair & royal blue armor
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            {/* Background subtle vignette */}
            <rect width="64" height="64" fill="#0f172a" />
            {/* Hair back */}
            <path d="M 18 16 Q 10 32 14 50 Q 22 54 26 44" fill="#ca8a04" />
            <path d="M 20 18 Q 14 30 18 48" fill="#eab308" />
            {/* Cape & Shoulders */}
            <path d="M 6 64 L 6 52 Q 18 42 34 46 L 58 52 L 58 64 Z" fill="#1e3a8a" />
            <path d="M 12 50 Q 24 44 40 47 L 44 64 L 20 64 Z" fill="#2563eb" />
            {/* Gold Gorget / Trim */}
            <path d="M 24 46 Q 32 50 40 46 L 42 52 Q 32 56 22 52 Z" fill="#facc15" />
            {/* Neck & Face */}
            <path d="M 28 36 L 28 46 L 38 46 L 38 36 Z" fill="#fbcfe8" />
            <path d="M 22 18 Q 20 34 26 38 Q 36 42 42 36 Q 46 28 42 18 Q 34 14 22 18 Z" fill="#fed7aa" />
            {/* Earring */}
            <circle cx="23" cy="30" r="2" fill="#c084fc" />
            {/* Facial details (Eyes, Nose, Mouth profile) */}
            <path d="M 38 24 L 43 25 L 39 27" stroke="#7c2d12" strokeWidth="1.5" fill="none" />
            <path d="M 34 22 Q 38 21 40 23" stroke="#451a03" strokeWidth="1.5" fill="none" />
            <circle cx="37" cy="24" r="1.5" fill="#1e3a8a" />
            <path d="M 36 32 Q 40 33 42 31" stroke="#9a3412" strokeWidth="1.5" fill="none" />
            {/* Flowing Blonde Bangs & Headband */}
            <path d="M 26 12 Q 36 10 44 16 Q 34 16 30 20 Q 24 16 26 12 Z" fill="#fef08a" />
            <path d="M 24 18 Q 32 16 36 22 Q 28 22 24 18 Z" fill="#fde047" />
            <path d="M 28 14 Q 38 18 42 22 L 40 24 Q 34 18 26 16 Z" fill="#ca8a04" />
          </svg>
        );

      case 'Mago':
        // Mysterious Sorcerer with pointed wizard cowl & mystical aura
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#1e1b4b" />
            {/* Mystical glow */}
            <circle cx="32" cy="32" r="28" fill="#4338ca" opacity="0.3" />
            {/* Robe shoulders */}
            <path d="M 4 64 L 10 48 Q 32 40 54 48 L 60 64 Z" fill="#312e81" />
            <path d="M 18 48 Q 32 44 46 48 L 50 64 L 14 64 Z" fill="#4338ca" />
            {/* Silver collar brooch */}
            <circle cx="32" cy="48" r="3" fill="#38bdf8" />
            <circle cx="32" cy="48" r="1.5" fill="#ffffff" />
            {/* Dark Cowl / Hood */}
            <path d="M 14 42 Q 10 18 32 8 Q 54 18 50 42 Q 32 46 14 42 Z" fill="#1e1b4b" />
            <path d="M 18 40 Q 14 22 32 14 Q 50 22 46 40 Q 32 44 18 40 Z" fill="#0f172a" />
            {/* Shadowed Face */}
            <ellipse cx="32" cy="30" rx="12" ry="10" fill="#020617" />
            {/* Glowing Ethereal Eyes */}
            <ellipse cx="27" cy="29" rx="3.5" ry="2" fill="#38bdf8" />
            <ellipse cx="27" cy="29" rx="1.5" ry="1" fill="#ffffff" />
            <ellipse cx="37" cy="29" rx="3.5" ry="2" fill="#38bdf8" />
            <ellipse cx="37" cy="29" rx="1.5" ry="1" fill="#ffffff" />
            {/* Silver Runes on Cowl */}
            <path d="M 28 11 L 32 6 L 36 11" stroke="#818cf8" strokeWidth="1.5" fill="none" />
          </svg>
        );

      case 'Alquimista':
        // Locke / Alchemist style adventurer with brass goggles & leather hood
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#064e3b" />
            {/* Coat */}
            <path d="M 6 64 L 10 50 Q 32 44 54 50 L 58 64 Z" fill="#065f46" />
            <path d="M 16 52 Q 32 46 48 52 L 52 64 L 12 64 Z" fill="#047857" />
            {/* Potion straps */}
            <rect x="22" y="52" width="6" height="10" rx="2" fill="#10b981" />
            <rect x="36" y="52" width="6" height="10" rx="2" fill="#3b82f6" />
            {/* Face & Wild Silver Hair */}
            <path d="M 16 28 Q 12 40 22 44 Q 32 48 44 42 Q 50 34 46 24" fill="#94a3b8" />
            <path d="M 22 22 Q 18 36 24 40 Q 34 44 40 38 Q 44 30 40 20 Z" fill="#fde047" opacity="0.3" />
            <path d="M 24 22 Q 22 34 26 38 Q 34 42 40 36 Q 42 28 38 20 Z" fill="#fed7aa" />
            {/* Bandana on forehead */}
            <path d="M 20 18 Q 32 14 44 18 L 44 24 Q 32 20 20 24 Z" fill="#0284c7" />
            {/* Brass Goggles */}
            <circle cx="28" cy="22" r="5" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="28" cy="22" r="3.5" fill="#34d399" />
            <circle cx="38" cy="22" r="5" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="38" cy="22" r="3.5" fill="#34d399" />
            <path d="M 33 22 L 35 22" stroke="#f59e0b" strokeWidth="2" />
            {/* Smirk & Nose */}
            <path d="M 38 29 L 41 30 L 38 32" stroke="#78350f" strokeWidth="1.2" fill="none" />
            <path d="M 33 34 Q 37 36 40 34" stroke="#78350f" strokeWidth="1.5" fill="none" />
          </svg>
        );

      case 'Arqueiro':
        // Forest Ranger with green hood, focused eyes & feather
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#14532d" />
            {/* Quiver & Shoulder */}
            <path d="M 6 64 L 12 48 Q 32 42 52 48 L 58 64 Z" fill="#166534" />
            <path d="M 44 40 L 56 22 L 60 25 L 48 44 Z" fill="#78350f" />
            {/* Arrow fletching */}
            <path d="M 54 22 L 60 16 L 62 18 L 56 24 Z" fill="#ffffff" />
            {/* Hood */}
            <path d="M 16 38 Q 12 14 32 8 Q 52 14 48 38 Q 32 44 16 38 Z" fill="#15803d" />
            {/* Feather */}
            <path d="M 38 8 Q 50 2 56 6 Q 48 12 40 10 Z" fill="#ef4444" />
            {/* Face inside hood */}
            <path d="M 22 20 Q 20 34 26 38 Q 34 42 38 38 Q 44 32 42 20 Z" fill="#ffedd5" />
            {/* Sharp Eyes */}
            <path d="M 26 25 Q 29 23 32 25" stroke="#14532d" strokeWidth="1.5" fill="none" />
            <circle cx="29" cy="26" r="1.5" fill="#16a34a" />
            <path d="M 34 25 Q 37 23 40 25" stroke="#14532d" strokeWidth="1.5" fill="none" />
            <circle cx="37" cy="26" r="1.5" fill="#16a34a" />
            <path d="M 32 30 L 34 32 L 31 33" stroke="#9a3412" strokeWidth="1" fill="none" />
          </svg>
        );

      case 'Lutador':
        // Cyan / Martial Artist style with red headband & fierce samurai look
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#450a0a" />
            {/* Gi Shoulders */}
            <path d="M 6 64 L 12 48 Q 32 42 52 48 L 58 64 Z" fill="#991b1b" />
            <path d="M 22 48 Q 32 44 42 48 L 38 64 L 26 64 Z" fill="#fed7aa" />
            {/* Dark spiked hair & Topknot */}
            <path d="M 18 20 Q 14 8 26 6 Q 38 4 48 10 Q 52 24 48 30" fill="#18181b" />
            <path d="M 38 6 Q 46 0 48 4" stroke="#18181b" strokeWidth="4" />
            {/* Red Headband */}
            <path d="M 18 18 Q 32 14 46 18 L 46 22 Q 32 18 18 22 Z" fill="#dc2626" />
            <path d="M 44 20 L 56 26 L 54 30 L 44 22 Z" fill="#b91c1c" />
            {/* Rugged Face */}
            <path d="M 22 22 Q 20 36 26 42 Q 34 44 38 40 Q 44 34 42 22 Z" fill="#fdba74" />
            {/* Mustache / Beard (Cyan style!) */}
            <path d="M 26 34 Q 32 32 38 34 Q 38 38 35 38 Q 32 35 28 38 Z" fill="#18181b" />
            {/* Piercing Eyes & Eyebrows */}
            <path d="M 24 24 L 30 25" stroke="#18181b" strokeWidth="2" />
            <path d="M 34 25 L 40 24" stroke="#18181b" strokeWidth="2" />
            <circle cx="28" cy="27" r="1.5" fill="#18181b" />
            <circle cx="36" cy="27" r="1.5" fill="#18181b" />
          </svg>
        );

      case 'Inventor':
      default:
        // Engineer with brass goggles, tool gear & leather cap
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#78350f" />
            {/* Leather Vest & Wrench */}
            <path d="M 6 64 L 12 50 Q 32 46 52 50 L 58 64 Z" fill="#92400e" />
            <path d="M 12 52 L 20 40 L 24 43 L 16 56 Z" fill="#94a3b8" />
            {/* Aviator Leather Cap */}
            <path d="M 16 16 Q 32 8 48 16 L 48 30 Q 32 26 16 30 Z" fill="#451a03" />
            <path d="M 14 26 L 14 36 L 20 34 L 18 26 Z" fill="#451a03" />
            {/* Large Brass Eyepiece / Goggles */}
            <circle cx="28" cy="22" r="6" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />
            <circle cx="28" cy="22" r="4" fill="#38bdf8" />
            <circle cx="40" cy="22" r="6" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />
            <circle cx="40" cy="22" r="4" fill="#38bdf8" />
            {/* Face */}
            <path d="M 22 26 Q 20 38 26 42 Q 34 44 38 40 Q 42 34 40 26 Z" fill="#fed7aa" />
            <path d="M 30 36 Q 34 38 38 36" stroke="#78350f" strokeWidth="1.5" fill="none" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-lg overflow-hidden border-[2px] border-[#d1d5db] shadow-[inset_0_0_0_1px_#000,0_2px_4px_rgba(0,0,0,0.8)] bg-[#020617] ${className}`}
    >
      {renderClassArt()}
      {/* Mini class badge */}
      <span className="absolute bottom-0 right-0 text-xs md:text-sm bg-black/70 px-1 rounded-tl leading-none">
        {emoji}
      </span>
    </div>
  );
};
