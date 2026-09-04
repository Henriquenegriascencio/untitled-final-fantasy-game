const fs = require('fs');
let code = fs.readFileSync('src/components/CharacterCreation.tsx', 'utf-8');

// 1. Reset party to nulls
code = code.replace(
  /const \[party, setParty\] = useState<\(Hero \| null\)\[\]>\(\[\s*\{[\s\S]*?\}\s*\]\);/,
  "const [party, setParty] = useState<(Hero | null)[]>([null, null, null, null]);"
);

// 2. Change root div to integrate better and not have double bg-black if that was the "div preta" 
// Or maybe just remove bg-black from it? No, if we just make it flex-1 it fits inside App.tsx which is bg-slate-950. 
// Or let's make it fixed inset-0 bg-black z-50 to cover the whole screen properly.
code = code.replace(
  '<div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-mono select-none">',
  '<div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4 font-mono select-none z-50">\n      <h1 className="text-white text-3xl md:text-5xl font-black uppercase tracking-widest mb-16 text-center drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">Escolha a sua equipe</h1>'
);

// 3. Increase gaps
code = code.replace(
  'className="grid grid-cols-2 gap-4 md:gap-8 mb-8 w-full max-w-2xl"',
  'className="grid grid-cols-2 gap-8 md:gap-16 mb-8 w-full max-w-2xl"'
);

// 4. Remove Empty text
code = code.replace(
  '<div className="h-full w-full flex items-center justify-center text-slate-400 text-lg uppercase animate-pulse">\n                  Empty\n                </div>',
  '<div className="h-full w-full bg-[#0000a8] animate-pulse"></div>'
);

fs.writeFileSync('src/components/CharacterCreation.tsx', code);
