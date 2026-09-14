import React from 'react';
import { HeroClass, EnemyType } from '../types';

export interface HeroPortraitProps {
  heroClass?: HeroClass;
  emoji?: string;
  name?: string;
  className?: string;
  hideBadge?: boolean;
}

export const HeroPortrait: React.FC<HeroPortraitProps> = ({
  heroClass = 'Cavalheiro',
  emoji = '',
  name = '',
  className = '',
  hideBadge = false,
}) => {
  // Renders a high-detail SNES-style bust portrait tailored to the character class
  const renderClassArt = () => {
    switch (heroClass) {
      case 'Guerreiro':
      case 'Cavalheiro':
        // Guerreiro: Tanque com armadura pesada de aco e ombreiras robustas
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#0f172a" />
            <path d="M 18 16 Q 10 32 14 50 Q 22 54 26 44" fill="#991b1b" />
            <path d="M 20 18 Q 14 30 18 48" fill="#dc2626" />
            <path d="M 6 64 L 6 50 Q 18 40 34 44 L 58 50 L 58 64 Z" fill="#334155" />
            <path d="M 12 48 Q 24 42 40 45 L 44 64 L 20 64 Z" fill="#475569" />
            <path d="M 24 44 Q 32 48 40 44 L 42 50 Q 32 54 22 50 Z" fill="#94a3b8" />
            <path d="M 28 34 L 28 44 L 38 44 L 38 34 Z" fill="#fbcfe8" />
            <path d="M 22 18 Q 20 34 26 38 Q 36 42 42 36 Q 46 28 42 18 Q 34 14 22 18 Z" fill="#fed7aa" />
            <path d="M 38 24 L 43 25 L 39 27" stroke="#7c2d12" strokeWidth="1.5" fill="none" />
            <path d="M 34 22 Q 38 21 40 23" stroke="#451a03" strokeWidth="1.5" fill="none" />
            <circle cx="37" cy="24" r="1.5" fill="#0284c7" />
            <path d="M 36 32 Q 40 33 42 31" stroke="#9a3412" strokeWidth="1.5" fill="none" />
            <path d="M 24 10 Q 34 6 44 12 Q 34 14 28 18 Q 22 14 24 10 Z" fill="#b91c1c" />
            <path d="M 22 16 Q 30 14 36 20 Q 28 20 22 16 Z" fill="#ef4444" />
          </svg>
        );

      case 'Cavaleiro':
        // Cavaleiro (Guerreiro Promovido): Armadura real prateada com elmo e guarnicao de ouro
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#020617" />
            <path d="M 6 64 L 6 48 Q 18 38 34 42 L 58 48 L 58 64 Z" fill="#1e3a8a" />
            <path d="M 10 46 Q 24 40 42 43 L 46 64 L 18 64 Z" fill="#2563eb" />
            <path d="M 22 42 Q 32 46 42 42 L 44 48 Q 32 52 20 48 Z" fill="#facc15" />
            <path d="M 18 20 Q 16 38 24 42 Q 36 44 42 38 Q 46 28 44 18 Q 34 12 20 18 Z" fill="#cbd5e1" />
            <path d="M 24 8 Q 32 2 40 8 L 44 24 Q 32 18 20 24 Z" fill="#64748b" />
            <path d="M 28 4 Q 32 0 36 4 L 38 12 L 26 12 Z" fill="#eab308" />
            <path d="M 26 22 L 38 22 L 36 26 L 28 26 Z" fill="#0f172a" />
            <circle cx="29" cy="24" r="1.5" fill="#38bdf8" />
            <circle cx="35" cy="24" r="1.5" fill="#38bdf8" />
          </svg>
        );

      case 'Ladrao':
        // Ladrao: Capuz agil de ladino verde/cinza com adaga e olhar perspicaz
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#064e3b" />
            <path d="M 6 64 L 10 50 Q 32 44 54 50 L 58 64 Z" fill="#065f46" />
            <path d="M 16 52 Q 32 46 48 52 L 52 64 L 12 64 Z" fill="#047857" />
            <path d="M 16 38 Q 12 14 32 8 Q 52 14 48 38 Q 32 44 16 38 Z" fill="#0284c7" />
            <path d="M 20 18 Q 32 12 44 18 L 44 24 Q 32 20 20 24 Z" fill="#0369a1" />
            <path d="M 22 20 Q 20 34 26 38 Q 34 42 38 38 Q 44 32 42 20 Z" fill="#ffedd5" />
            <path d="M 26 25 Q 29 23 32 25" stroke="#0369a1" strokeWidth="1.5" fill="none" />
            <circle cx="29" cy="26" r="1.5" fill="#38bdf8" />
            <path d="M 34 25 Q 37 23 40 25" stroke="#0369a1" strokeWidth="1.5" fill="none" />
            <circle cx="37" cy="26" r="1.5" fill="#38bdf8" />
            <path d="M 32 30 L 34 32 L 31 33" stroke="#9a3412" strokeWidth="1" fill="none" />
            <path d="M 28 35 Q 33 37 38 34" stroke="#78350f" strokeWidth="1.5" fill="none" />
          </svg>
        );

      case 'Ninja':
      case 'Arqueiro':
        // Ninja (Ladrao Promovido): Mascara ninja oriental com faixa vermelha e olhos afiados
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#18181b" />
            <path d="M 6 64 L 12 48 Q 32 42 52 48 L 58 64 Z" fill="#27272a" />
            <path d="M 18 48 Q 32 44 46 48 L 50 64 L 14 64 Z" fill="#3f3f46" />
            <path d="M 16 38 Q 12 12 32 8 Q 52 12 48 38 Q 32 42 16 38 Z" fill="#18181b" />
            <path d="M 18 16 Q 32 12 46 16 L 46 22 Q 32 18 18 22 Z" fill="#dc2626" />
            <path d="M 44 18 L 56 24 L 54 28 L 44 20 Z" fill="#b91c1c" />
            <rect x="22" y="22" width="20" height="8" fill="#fed7aa" />
            <circle cx="27" cy="26" r="1.5" fill="#ef4444" />
            <circle cx="37" cy="26" r="1.5" fill="#ef4444" />
            <path d="M 18 30 Q 32 28 46 30 L 44 42 Q 32 46 20 42 Z" fill="#27272a" />
          </svg>
        );

      case 'Monge':
      case 'Lutador':
        // Monge: Artista marcial desarmado com faixa na testa e peito aberto
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#451a03" />
            <path d="M 6 64 L 12 48 Q 32 42 52 48 L 58 64 Z" fill="#b45309" />
            <path d="M 22 48 Q 32 44 42 48 L 38 64 L 26 64 Z" fill="#fed7aa" />
            <path d="M 18 20 Q 14 8 26 6 Q 38 4 48 10 Q 52 24 48 30" fill="#78350f" />
            <path d="M 18 18 Q 32 14 46 18 L 46 22 Q 32 18 18 22 Z" fill="#f59e0b" />
            <path d="M 44 20 L 56 26 L 54 30 L 44 22 Z" fill="#d97706" />
            <path d="M 22 22 Q 20 36 26 42 Q 34 44 38 40 Q 44 34 42 22 Z" fill="#fdba74" />
            <path d="M 24 24 L 30 25" stroke="#18181b" strokeWidth="2" />
            <path d="M 34 25 L 40 24" stroke="#18181b" strokeWidth="2" />
            <circle cx="28" cy="27" r="1.5" fill="#18181b" />
            <circle cx="36" cy="27" r="1.5" fill="#18181b" />
            <path d="M 30 36 Q 34 38 38 36" stroke="#78350f" strokeWidth="1.5" fill="none" />
          </svg>
        );

      case 'Mestre':
        // Mestre (Monge Promovido): Grande mestre de artes marciais lendario com postura imponente
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#7f1d1d" />
            <path d="M 6 64 L 12 48 Q 32 42 52 48 L 58 64 Z" fill="#991b1b" />
            <path d="M 22 48 Q 32 44 42 48 L 38 64 L 26 64 Z" fill="#fef08a" />
            <path d="M 16 18 Q 12 4 28 2 Q 44 2 48 10 Q 52 24 48 30" fill="#ffffff" />
            <path d="M 18 16 Q 32 12 46 16 L 46 20 Q 32 16 18 20 Z" fill="#fbbf24" />
            <path d="M 22 20 Q 20 36 26 42 Q 34 44 38 40 Q 44 34 42 20 Z" fill="#fdba74" />
            <path d="M 26 34 Q 32 30 38 34 Q 38 44 32 46 Q 26 44 26 34 Z" fill="#ffffff" />
            <path d="M 24 22 L 30 23" stroke="#451a03" strokeWidth="2" />
            <path d="M 34 23 L 40 22" stroke="#451a03" strokeWidth="2" />
            <circle cx="28" cy="25" r="1.5" fill="#eab308" />
            <circle cx="36" cy="25" r="1.5" fill="#eab308" />
          </svg>
        );

      case 'Mago Branco':
        // Mago Branco: Manto branco puro com triangulos vermelhos caracteristicos
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#0f172a" />
            <circle cx="32" cy="32" r="28" fill="#38bdf8" opacity="0.25" />
            <path d="M 4 64 L 10 48 Q 32 40 54 48 L 60 64 Z" fill="#f8fafc" />
            <path d="M 18 48 Q 32 44 46 48 L 50 64 L 14 64 Z" fill="#e2e8f0" />
            {/* Triangulos vermelhos de Mago Branco */}
            <polygon points="12,50 16,56 20,50" fill="#dc2626" />
            <polygon points="24,48 28,54 32,48" fill="#dc2626" />
            <polygon points="36,48 40,54 44,48" fill="#dc2626" />
            <polygon points="48,50 52,56 56,50" fill="#dc2626" />
            <path d="M 14 42 Q 10 16 32 8 Q 54 16 50 42 Q 32 46 14 42 Z" fill="#ffffff" />
            <path d="M 18 40 Q 14 22 32 14 Q 50 22 46 40 Q 32 44 18 40 Z" fill="#cbd5e1" />
            <ellipse cx="32" cy="30" rx="10" ry="10" fill="#fed7aa" />
            <circle cx="28" cy="28" r="1.5" fill="#0284c7" />
            <circle cx="36" cy="28" r="1.5" fill="#0284c7" />
            <path d="M 30 35 Q 32 37 34 35" stroke="#be123c" strokeWidth="1.5" fill="none" />
          </svg>
        );

      case 'Mago Branco Superior':
        // Mago Branco Superior: Vestes divinas com tiara sagrada e aura curativa resplandecente
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#1e1b4b" />
            <circle cx="32" cy="32" r="30" fill="#fef08a" opacity="0.3" />
            <path d="M 4 64 L 8 46 Q 32 38 56 46 L 60 64 Z" fill="#ffffff" />
            <path d="M 16 46 Q 32 42 48 46 L 52 64 L 12 64 Z" fill="#f1f5f9" />
            <polygon points="10,48 15,55 20,48" fill="#b91c1c" />
            <polygon points="22,46 27,53 32,46" fill="#b91c1c" />
            <polygon points="34,46 39,53 44,46" fill="#b91c1c" />
            <polygon points="46,48 51,55 56,48" fill="#b91c1c" />
            <path d="M 12 40 Q 8 12 32 6 Q 56 12 52 40 Q 32 44 12 40 Z" fill="#ffffff" />
            <path d="M 22 10 Q 32 4 42 10 L 44 16 Q 32 12 20 16 Z" fill="#facc15" />
            <circle cx="32" cy="11" r="2.5" fill="#38bdf8" />
            <ellipse cx="32" cy="28" rx="11" ry="11" fill="#fed7aa" />
            <circle cx="28" cy="27" r="1.5" fill="#38bdf8" />
            <circle cx="36" cy="27" r="1.5" fill="#38bdf8" />
            <path d="M 30 33 Q 32 35 34 33" stroke="#be123c" strokeWidth="1.5" fill="none" />
          </svg>
        );

      case 'Mago Negro':
      case 'Mago':
        // Mago Negro: Chapeu pontudo classico azul/amarelo com rosto na sombra e olhos amarelos brilhantes
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#020617" />
            <circle cx="32" cy="32" r="28" fill="#4338ca" opacity="0.3" />
            <path d="M 4 64 L 10 48 Q 32 40 54 48 L 60 64 Z" fill="#1e3a8a" />
            <path d="M 18 48 Q 32 44 46 48 L 50 64 L 14 64 Z" fill="#2563eb" />
            {/* Chapeu pontudo de Mago Negro */}
            <path d="M 6 36 Q 32 26 58 36 L 50 32 L 36 4 L 32 2 L 28 4 L 14 32 Z" fill="#d97706" />
            <path d="M 10 36 Q 32 30 54 36 L 46 33 L 34 8 L 30 8 L 18 33 Z" fill="#f59e0b" />
            <ellipse cx="32" cy="38" rx="14" ry="10" fill="#020617" />
            <ellipse cx="27" cy="37" rx="3.5" ry="2" fill="#fef08a" />
            <circle cx="27" cy="37" r="1" fill="#ffffff" />
            <ellipse cx="37" cy="37" rx="3.5" ry="2" fill="#fef08a" />
            <circle cx="37" cy="37" r="1" fill="#ffffff" />
          </svg>
        );

      case 'Mago Negro Superior':
        // Mago Negro Superior: Mago Negro supremo com runas arcanas roxas e olhos incandescentes
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#3b0764" />
            <circle cx="32" cy="32" r="30" fill="#9333ea" opacity="0.4" />
            <path d="M 4 64 L 10 46 Q 32 38 54 46 L 60 64 Z" fill="#581c87" />
            <path d="M 18 46 Q 32 42 46 46 L 50 64 L 14 64 Z" fill="#6b21a8" />
            <path d="M 6 34 Q 32 24 58 34 L 50 30 L 36 2 L 32 0 L 28 2 L 14 30 Z" fill="#3b0764" />
            <path d="M 10 34 Q 32 28 54 34 L 46 31 L 34 6 L 30 6 L 18 31 Z" fill="#4c1d95" />
            <path d="M 28 12 L 32 8 L 36 12" stroke="#c084fc" strokeWidth="2" fill="none" />
            <ellipse cx="32" cy="36" rx="14" ry="10" fill="#020617" />
            <ellipse cx="26" cy="35" rx="4" ry="2.5" fill="#f43f5e" />
            <circle cx="26" cy="35" r="1.5" fill="#fef08a" />
            <ellipse cx="38" cy="35" rx="4" ry="2.5" fill="#f43f5e" />
            <circle cx="38" cy="35" r="1.5" fill="#fef08a" />
          </svg>
        );

      case 'Mago Vermelho':
        // Mago Vermelho: Chapeu vermelho elegante com pena branca e capa estilosa
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#450a0a" />
            <path d="M 4 64 L 10 48 Q 32 42 54 48 L 60 64 Z" fill="#991b1b" />
            <path d="M 18 48 Q 32 44 46 48 L 50 64 L 14 64 Z" fill="#b91c1c" />
            <path d="M 40 28 Q 54 12 58 8 Q 52 20 44 32 Z" fill="#ffffff" />
            <path d="M 10 34 Q 32 24 54 34 L 48 26 L 34 8 L 30 8 L 16 26 Z" fill="#b91c1c" />
            <path d="M 14 32 Q 32 26 50 32 L 46 28 L 34 12 L 30 12 L 18 28 Z" fill="#dc2626" />
            <path d="M 22 22 Q 20 36 26 40 Q 34 44 38 40 Q 44 34 42 22 Z" fill="#fed7aa" />
            <path d="M 26 26 Q 29 24 32 26" stroke="#451a03" strokeWidth="1.5" fill="none" />
            <circle cx="29" cy="27" r="1.5" fill="#1e3a8a" />
            <path d="M 34 26 Q 37 24 40 26" stroke="#451a03" strokeWidth="1.5" fill="none" />
            <circle cx="37" cy="27" r="1.5" fill="#1e3a8a" />
            <path d="M 32 34 Q 36 36 39 34" stroke="#7f1d1d" strokeWidth="1.5" fill="none" />
          </svg>
        );

      case 'Mago Vermelho Superior':
      case 'Alquimista':
      case 'Inventor':
      default:
        // Mago Vermelho Superior: Traje nobre escarlate com detalhes de ouro e pena dourada
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#581c87" />
            <path d="M 4 64 L 10 46 Q 32 40 54 46 L 60 64 Z" fill="#7f1d1d" />
            <path d="M 18 46 Q 32 42 46 46 L 50 64 L 14 64 Z" fill="#991b1b" />
            <path d="M 24 44 Q 32 48 40 44 L 42 50 Q 32 54 22 50 Z" fill="#facc15" />
            <path d="M 42 26 Q 56 8 62 4 Q 54 18 46 30 Z" fill="#fef08a" />
            <path d="M 8 32 Q 32 22 56 32 L 48 24 L 34 6 L 30 6 L 16 24 Z" fill="#991b1b" />
            <path d="M 12 30 Q 32 24 52 30 L 46 26 L 34 10 L 30 10 L 18 26 Z" fill="#dc2626" />
            <path d="M 22 20 Q 20 36 26 40 Q 34 44 38 40 Q 44 34 42 20 Z" fill="#fed7aa" />
            <circle cx="29" cy="26" r="1.5" fill="#facc15" />
            <circle cx="37" cy="26" r="1.5" fill="#facc15" />
            <path d="M 32 33 Q 36 35 39 33" stroke="#7f1d1d" strokeWidth="1.5" fill="none" />
          </svg>
        );
    }
  };

  const hasSize = className && (className.includes('w-') || className.includes('size-'));
  const sizeClass = hasSize ? '' : 'w-16 h-16 md:w-20 md:h-20';

  return (
    <div
      className={`relative shrink-0 rounded-lg overflow-hidden border-[2px] border-[#d1d5db] shadow-[inset_0_0_0_1px_#000,0_2px_4px_rgba(0,0,0,0.8)] bg-[#020617] ${sizeClass} ${className}`}
    >
      {renderClassArt()}
      {/* Mini class badge */}
      {!hideBadge && (
        <span className="absolute bottom-0 right-0 text-xs md:text-sm bg-black/70 px-1 rounded-tl leading-none">
          {emoji}
        </span>
      )}
    </div>
  );
};

export interface EnemyPortraitProps {
  enemyType?: EnemyType | string;
  emoji?: string;
  className?: string;
}

export interface EnemyPortraitProps {
  enemyType?: EnemyType | string;
  emoji?: string;
  className?: string;
}

export const EnemyPortrait: React.FC<EnemyPortraitProps> = ({
  enemyType = 'slime',
  emoji = '',
  className = '',
}) => {
  const renderEnemyArt = () => {
    switch (enemyType) {
      case 'cactuar_fugitivo':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#064e3b" />
            <rect x="26" y="16" width="12" height="34" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <rect x="14" y="24" width="12" height="8" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <rect x="14" y="16" width="8" height="12" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <rect x="38" y="32" width="12" height="8" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <rect x="42" y="36" width="8" height="12" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <circle cx="29" cy="24" r="2" fill="#000" />
            <circle cx="35" cy="24" r="2" fill="#000" />
            <ellipse cx="32" cy="34" rx="2.5" ry="4" fill="#000" />
            {/* Agulhas */}
            <line x1="30" y1="12" x2="30" y2="16" stroke="#facc15" strokeWidth="2" />
            <line x1="34" y1="10" x2="34" y2="16" stroke="#facc15" strokeWidth="2" />
          </svg>
        );

      case 'tonberry_cozinha':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#1c1917" />
            {/* Roupao */}
            <path d="M 18 24 Q 32 16 46 24 L 52 56 L 12 56 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
            {/* Cabeca verde */}
            <circle cx="32" cy="24" r="12" fill="#86efac" stroke="#16a34a" strokeWidth="1.5" />
            <circle cx="28" cy="22" r="2.5" fill="#facc15" />
            <circle cx="36" cy="22" r="2.5" fill="#facc15" />
            {/* Faca de cozinha */}
            <rect x="44" y="36" width="12" height="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            <rect x="40" y="37" width="5" height="4" fill="#451a03" />
            {/* Lanterna */}
            <rect x="14" y="36" width="8" height="10" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="18" cy="41" r="2.5" fill="#ffffff" />
          </svg>
        );

      case 'mimico_bau':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#450a0a" />
            {/* Bau aberto com dentes */}
            <path d="M 12 24 L 52 16 L 48 8 L 8 16 Z" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
            <rect x="10" y="28" width="44" height="24" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
            <rect x="28" y="34" width="8" height="12" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />
            {/* Dentes */}
            <polygon points="14,28 18,36 22,28" fill="#fff" />
            <polygon points="24,28 28,36 32,28" fill="#fff" />
            <polygon points="34,28 38,36 42,28" fill="#fff" />
            <polygon points="44,28 48,36 52,28" fill="#fff" />
            {/* Olhos de monstro */}
            <circle cx="22" cy="22" r="3" fill="#ef4444" />
            <circle cx="42" cy="22" r="3" fill="#ef4444" />
            {/* Lingua */}
            <path d="M 26 38 Q 32 48 38 38" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          </svg>
        );

      case 'boss_terra':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#14532d" />
            {/* Caveira Lich */}
            <path d="M 14 64 L 20 28 Q 32 10 44 28 L 50 64 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="32" cy="26" r="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
            <ellipse cx="27" cy="24" rx="3.5" ry="4" fill="#000" />
            <ellipse cx="37" cy="24" rx="3.5" ry="4" fill="#000" />
            <circle cx="27" cy="24" r="1" fill="#4ade80" />
            <circle cx="37" cy="24" r="1" fill="#4ade80" />
            <rect x="28" y="32" width="8" height="4" fill="#000" />
            <path d="M 22 14 L 32 8 L 42 14 L 38 18 L 26 18 Z" fill="#eab308" stroke="#a16207" strokeWidth="1" />
          </svg>
        );

      case 'boss_fogo':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#7c2d12" />
            <path d="M 12 64 Q 32 48 52 64" fill="#ea580c" />
            <circle cx="32" cy="24" r="10" fill="#fbcfe8" stroke="#e11d48" strokeWidth="1.5" />
            <path d="M 22 14 Q 32 4 42 14 L 40 28 L 24 28 Z" fill="#dc2626" />
            <ellipse cx="28" cy="22" rx="2" ry="2" fill="#e11d48" />
            <ellipse cx="36" cy="22" rx="2" ry="2" fill="#e11d48" />
            {/* Espadas em multiplos bracos */}
            <line x1="8" y1="28" x2="20" y2="38" stroke="#facc15" strokeWidth="2.5" />
            <line x1="56" y1="28" x2="44" y2="38" stroke="#facc15" strokeWidth="2.5" />
            <line x1="6" y1="44" x2="22" y2="46" stroke="#facc15" strokeWidth="2.5" />
            <line x1="58" y1="44" x2="42" y2="46" stroke="#facc15" strokeWidth="2.5" />
          </svg>
        );

      case 'boss_agua':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#0c4a6e" />
            {/* Kraken */}
            <circle cx="32" cy="26" r="16" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
            <ellipse cx="26" cy="24" rx="4" ry="5" fill="#facc15" />
            <circle cx="26" cy="24" r="2" fill="#000" />
            <ellipse cx="38" cy="24" rx="4" ry="5" fill="#facc15" />
            <circle cx="38" cy="24" r="2" fill="#000" />
            {/* Tentaculos */}
            <path d="M 12 58 Q 18 36 26 42" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 22 62 Q 28 42 32 42" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 42 62 Q 36 42 32 42" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 52 58 Q 46 36 38 42" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" />
          </svg>
        );

      case 'boss_ar':
      case 'boss_chaos':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#1e1b4b" />
            <circle cx="32" cy="32" r="28" fill="#6366f1" opacity="0.3" />
            <path d="M 20 20 Q 8 6 10 2 Q 18 8 26 14" fill="#eab308" stroke="#a16207" strokeWidth="1.5" />
            <path d="M 44 20 Q 56 6 54 2 Q 46 8 38 14" fill="#eab308" stroke="#a16207" strokeWidth="1.5" />
            <path d="M 18 16 Q 32 10 46 16 L 50 36 Q 44 56 32 60 Q 20 56 14 36 Z" fill="#4338ca" stroke="#312e81" strokeWidth="2" />
            <circle cx="28" cy="32" r="3" fill="#facc15" />
            <circle cx="36" cy="32" r="3" fill="#facc15" />
            <circle cx="28" cy="32" r="1.5" fill="#dc2626" />
            <circle cx="36" cy="32" r="1.5" fill="#dc2626" />
            <path d="M 26 44 Q 32 50 38 44" stroke="#facc15" strokeWidth="2" fill="none" />
          </svg>
        );

      case 'slime':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#064e3b" />
            <ellipse cx="32" cy="54" rx="26" ry="7" fill="#047857" />
            <path d="M 12 48 Q 10 26 28 14 Q 32 10 36 14 Q 54 26 52 48 Q 44 56 32 56 Q 20 56 12 48 Z" fill="#10b981" />
            <path d="M 16 48 Q 20 30 32 20 Q 44 30 48 48 Q 40 53 32 53 Q 24 53 16 48 Z" fill="#34d399" />
            <ellipse cx="24" cy="24" rx="5" ry="3" fill="#ecfdf5" transform="rotate(-30 24 24)" />
            <circle cx="21" cy="32" r="2" fill="#ecfdf5" />
            <ellipse cx="26" cy="38" rx="4" ry="4" fill="#0f172a" />
            <circle cx="25" cy="37" r="1.5" fill="#ffffff" />
            <ellipse cx="38" cy="38" rx="4" ry="4" fill="#0f172a" />
            <circle cx="37" cy="37" r="1.5" fill="#ffffff" />
            <path d="M 30 46 Q 32 48 34 46" stroke="#064e3b" strokeWidth="2" fill="none" />
          </svg>
        );

      case 'goblin':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#14532d" />
            <polygon points="6,30 20,24 18,38" fill="#4ade80" stroke="#15803d" strokeWidth="1" />
            <polygon points="58,30 44,24 46,38" fill="#4ade80" stroke="#15803d" strokeWidth="1" />
            <polygon points="10,31 19,27 18,35" fill="#f43f5e" />
            <polygon points="54,31 45,27 46,35" fill="#f43f5e" />
            <ellipse cx="32" cy="34" rx="16" ry="18" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <path d="M 16 26 Q 32 10 48 26 L 46 20 Q 32 4 18 20 Z" fill="#78350f" />
            <polygon points="32,4 40,2 48,16" fill="#78350f" />
            <ellipse cx="25" cy="32" rx="3.5" ry="3" fill="#facc15" />
            <circle cx="26" cy="32" r="1.5" fill="#78350f" />
            <ellipse cx="39" cy="32" rx="3.5" ry="3" fill="#facc15" />
            <circle cx="38" cy="32" r="1.5" fill="#78350f" />
            <polygon points="32,30 29,40 33,40" fill="#16a34a" />
            <path d="M 24 46 Q 32 52 40 46" stroke="#0f172a" strokeWidth="2" fill="#7f1d1d" />
            <polygon points="26,45 28,48 30,45" fill="#ffffff" />
            <polygon points="34,45 36,48 38,45" fill="#ffffff" />
          </svg>
        );

      case 'orc':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#3b0764" />
            <path d="M 12 28 Q 16 8 32 8 Q 48 8 52 28 L 52 34 L 12 34 Z" fill="#475569" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 14 26 Q 4 20 6 12 Q 12 18 16 22" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
            <path d="M 50 26 Q 60 20 58 12 Q 52 18 48 22" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
            <rect x="22" y="16" width="20" height="4" fill="#94a3b8" />
            <path d="M 16 32 Q 14 50 32 54 Q 50 50 48 32 Z" fill="#65a30d" stroke="#365314" strokeWidth="1.5" />
            <ellipse cx="24" cy="36" rx="3.5" ry="2" fill="#ef4444" />
            <circle cx="24" cy="36" r="1" fill="#fee2e2" />
            <ellipse cx="40" cy="36" rx="3.5" ry="2" fill="#ef4444" />
            <circle cx="40" cy="36" r="1" fill="#fee2e2" />
            <path d="M 21 33 L 28 34" stroke="#1c1917" strokeWidth="2" />
            <path d="M 36 34 L 43 33" stroke="#1c1917" strokeWidth="2" />
            <path d="M 22 50 L 25 40 L 28 50" fill="#f8fafc" stroke="#365314" strokeWidth="1" />
            <path d="M 42 50 L 39 40 L 36 50" fill="#f8fafc" stroke="#365314" strokeWidth="1" />
            <path d="M 26 48 Q 32 50 38 48" stroke="#1c1917" strokeWidth="2" fill="#450a0a" />
          </svg>
        );

      case 'elemental':
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#450a0a" />
            <circle cx="32" cy="32" r="28" fill="#f97316" opacity="0.3" />
            <circle cx="32" cy="32" r="22" fill="#ea580c" opacity="0.4" />
            <polygon points="12,18 16,10 20,20" fill="#fde047" />
            <polygon points="46,14 52,8 50,22" fill="#fde047" />
            <polygon points="10,44 18,52 14,38" fill="#fde047" />
            <polygon points="50,46 54,38 46,52" fill="#fde047" />
            <circle cx="32" cy="32" r="16" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="32" cy="32" r="10" fill="#ffffff" />
            <ellipse cx="26" cy="30" rx="3" ry="2" fill="#7f1d1d" />
            <circle cx="26" cy="30" r="1" fill="#ffffff" />
            <ellipse cx="38" cy="30" rx="3" ry="2" fill="#7f1d1d" />
            <circle cx="38" cy="30" r="1" fill="#ffffff" />
            <path d="M 28 38 Q 32 40 36 38" stroke="#7f1d1d" strokeWidth="2" fill="none" />
          </svg>
        );

      case 'boss':
      case 'boss_preludio':
      case 'boss_desafio':
      default:
        return (
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <rect width="64" height="64" fill="#18181b" />
            <circle cx="32" cy="32" r="28" fill="#dc2626" opacity="0.25" />
            <path d="M 20 20 Q 8 6 10 2 Q 18 8 26 14" fill="#ca8a04" stroke="#78350f" strokeWidth="1.5" />
            <path d="M 44 20 Q 56 6 54 2 Q 46 8 38 14" fill="#ca8a04" stroke="#78350f" strokeWidth="1.5" />
            <path d="M 18 16 Q 32 10 46 16 L 50 36 Q 44 56 32 60 Q 20 56 14 36 Z" fill="#991b1b" stroke="#450a0a" strokeWidth="2" />
            <path d="M 32 12 L 32 44" stroke="#facc15" strokeWidth="2" strokeDasharray="3 2" />
            <polygon points="20,28 28,30 22,34" fill="#facc15" stroke="#78350f" strokeWidth="1" />
            <line x1="24" y1="28" x2="24" y2="34" stroke="#000" strokeWidth="1.5" />
            <polygon points="44,28 36,30 42,34" fill="#facc15" stroke="#78350f" strokeWidth="1" />
            <line x1="40" y1="28" x2="40" y2="34" stroke="#000" strokeWidth="1.5" />
            <circle cx="28" cy="48" r="2" fill="#450a0a" />
            <circle cx="36" cy="48" r="2" fill="#450a0a" />
            <path d="M 22 52 Q 32 56 42 52" stroke="#450a0a" strokeWidth="2" fill="none" />
            <polygon points="26,52 28,56 30,52" fill="#fff" />
            <polygon points="34,52 36,56 38,52" fill="#fff" />
          </svg>
        );
    }
  };

  const hasSize = className && (className.includes('w-') || className.includes('size-'));
  const sizeClass = hasSize ? '' : 'w-16 h-16 md:w-20 md:h-20';

  return (
    <div
      className={`relative shrink-0 rounded-lg overflow-hidden border-[2px] border-red-400 shadow-[inset_0_0_0_1px_#000,0_2px_4px_rgba(0,0,0,0.8)] bg-[#020617] ${sizeClass} ${className}`}
    >
      {renderEnemyArt()}
    </div>
  );
};

export interface UnitAvatarProps {
  unit?: {
    isPlayer?: boolean;
    heroClass?: HeroClass;
    enemyType?: EnemyType | string;
    type?: EnemyType | string;
    emoji?: string;
    name?: string;
  };
  heroClass?: HeroClass;
  enemyType?: EnemyType | string;
  emoji?: string;
  isPlayer?: boolean;
  className?: string;
  hideBadge?: boolean;
}

export const UnitAvatar: React.FC<UnitAvatarProps> = ({
  unit,
  heroClass,
  enemyType,
  emoji,
  isPlayer,
  className = '',
  hideBadge = true,
}) => {
  const actualIsPlayer = isPlayer ?? unit?.isPlayer ?? (!!heroClass || !!unit?.heroClass);
  const actualClass = heroClass ?? unit?.heroClass;
  const actualEnemyType = enemyType ?? unit?.enemyType ?? (unit as any)?.type;
  const actualEmoji = emoji ?? unit?.emoji ?? '';

  if (actualIsPlayer && actualClass) {
    return (
      <HeroPortrait
        heroClass={actualClass}
        emoji={actualEmoji}
        hideBadge={hideBadge}
        className={className}
      />
    );
  }

  if (!actualIsPlayer && actualEnemyType) {
    return (
      <EnemyPortrait
        enemyType={actualEnemyType}
        emoji={actualEmoji}
        className={className}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center shrink-0 bg-slate-900 border border-slate-700 ${className}`}>
      <span className="text-xs font-mono font-bold text-yellow-400 select-none">
        {unit?.name?.slice(0, 3)?.toUpperCase() || 'UNT'}
      </span>
    </div>
  );
};

