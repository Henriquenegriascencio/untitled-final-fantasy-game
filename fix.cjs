const fs = require('fs');
let code = fs.readFileSync('src/components/Combat.tsx', 'utf-8');

// Fix handleCellClick ATTACK
code = code.replace(`          const nextUnits = units.map(u => {
                if (u.id === player.id) return { ...u, stats: { ...u.stats, hp: Math.max(0, u.stats.hp - damage), sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
                return u;
             });`, `          const nextUnits = units.map(u => {
            if (u.id === target.id) {
               const newHp = Math.max(0, u.stats.hp - damage);
               return { ...u, stats: { ...u.stats, hp: newHp, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
            }
            if (u.id === activeUnit.id) {
               return { ...u, hasActed: true, stats: { ...u.stats, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
            }
            return u;
          });`);

// Fix aiTurn
let aiIdx = code.indexOf('const aiTurn = async () =>');
let aiNextUnitsIdx = code.indexOf('const nextUnits = units.map(u => {', aiIdx);
let aiSetUnitsIdx = code.indexOf('setUnits(nextUnits);', aiNextUnitsIdx);

let aiNextUnitsCode = `const nextUnits = units.map(u => {
                if (u.id === player.id) return { ...u, stats: { ...u.stats, hp: Math.max(0, u.stats.hp - damage), sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
                return u;
             });`;
             
code = code.substring(0, aiNextUnitsIdx) + aiNextUnitsCode + code.substring(aiSetUnitsIdx);

fs.writeFileSync('src/components/Combat.tsx', code);
