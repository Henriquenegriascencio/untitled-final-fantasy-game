const fs = require('fs');
let code = fs.readFileSync('src/components/Combat.tsx', 'utf-8');

const startIndex = code.indexOf('const handleCellClick = (x: number, y: number) => {');
const endIndex = code.indexOf('const checkWinCondition = (currentUnits: CombatUnit[]) => {');

let newFunc = `const handleCellClick = (x: number, y: number) => {
    if (!activeUnit || !activeUnit.isPlayer) return;

    if (selectedAction === 'MOVE' && !activeUnit.hasMoved) {
      const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
      if (dist > 0 && dist <= activeUnit.stats.mov) {
        if (units.some(u => u.x === x && u.y === y && u.stats.hp > 0)) {
          addLog('Célula ocupada!');
          return;
        }
        setUnits(prev => prev.map(u => u.id === activeUnit.id ? { ...u, x, y, hasMoved: true } : u));
        addLog('Moveu-se.');
        setSelectedAction(null);
      } else {
        addLog('Inválido ou fora de alcance.');
      }
    } 
    else if (selectedAction === 'ATTACK' && !activeUnit.hasActed) {
      const target = units.find(u => u.x === x && u.y === y && u.stats.hp > 0 && !u.isPlayer);
      if (target) {
        const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
        if (dist <= activeUnit.weapon.range) {
          const damage = Math.max(1, activeUnit.stats.for + activeUnit.weapon.damage - target.stats.def);
          
          const nextUnits = units.map(u => {
            if (u.id === target.id) {
               const newHp = Math.max(0, u.stats.hp - damage);
               return { ...u, stats: { ...u.stats, hp: newHp, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
            }
            if (u.id === activeUnit.id) {
               return { ...u, hasActed: true, stats: { ...u.stats, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
            }
            return u;
          });
          
          setUnits(nextUnits);
          addLog(\`Ataque causou \${damage} dano!\`);
          setSelectedAction(null);
          
          if (!checkWinCondition(nextUnits)) {
             setTimeout(nextTurn, 1000);
          }
        }
      }
    }
    else if (selectedAction === 'MAGIC' && !activeUnit.hasActed) {
      if (activeUnit.stats.mp >= 10) {
        const target = units.find(u => u.x === x && u.y === y && u.stats.hp > 0 && !u.isPlayer);
        if (target) {
            const dist = getDistance(activeUnit.x, activeUnit.y, x, y);
            if (dist <= 3) {
               const damage = Math.max(1, (activeUnit.stats.int * 2) - target.stats.def);
               
               const nextUnits = units.map(u => {
                 if (u.id === target.id) {
                    const newHp = Math.max(0, u.stats.hp - damage);
                    return { ...u, stats: { ...u.stats, hp: newHp, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 10) } };
                 }
                 if (u.id === activeUnit.id) {
                    return { ...u, hasActed: true, stats: { ...u.stats, mp: u.stats.mp - 10, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 10) } };
                 }
                 return u;
               });
               
               setUnits(nextUnits);
               addLog(\`\${selectedSubItem} causou \${damage} dano!\`);
               setSelectedAction(null);
               
               if (!checkWinCondition(nextUnits)) {
                  setTimeout(nextTurn, 1000);
               }
            } else {
               addLog('Fora de alcance.');
            }
        }
      } else {
         addLog('MP Insuficiente.');
      }
    }
    else if (selectedAction === 'SKILL' && !activeUnit.hasActed) {
      let spCost = 20;
      if (selectedSubItem === 'skill_2') spCost = 50;
      if (selectedSubItem === 'skill_3') spCost = 100;

      if ((activeUnit.stats.sp || 0) >= spCost) {
        const target = units.find(u => u.x === x && u.y === y && u.stats.hp > 0 && !u.isPlayer);
        if (target) {
            let damage = 0;
            let logMsg = '';
            
            let mult = 1;
            if (spCost === 50) mult = 2.5;
            if (spCost === 100) mult = 5;

            if (activeUnit.heroClass === 'Cavalheiro') { damage = (activeUnit.stats.for * 2.5 * mult) - target.stats.def; logMsg = 'Golpe Esmagador'; }
            if (activeUnit.heroClass === 'Mago') { damage = (activeUnit.stats.int * 3 * mult) - target.stats.def; logMsg = 'Explosão Arcana'; }
            if (activeUnit.heroClass === 'Alquimista') { damage = (activeUnit.stats.int * 2 * mult) + (15 * mult) - target.stats.def; logMsg = 'Poção Explosiva'; }
            if (activeUnit.heroClass === 'Arqueiro') { damage = (activeUnit.stats.for * 1.5 * mult) + (activeUnit.stats.vel * 1.5 * mult) - target.stats.def; logMsg = 'Chuva de Flechas'; }
            if (activeUnit.heroClass === 'Lutador') { damage = (activeUnit.stats.for * 3 * mult) - target.stats.def; logMsg = 'Soco Furacão'; }
            if (activeUnit.heroClass === 'Inventor') { damage = (activeUnit.stats.int * 1.5 * mult) + (activeUnit.stats.for * 1.5 * mult) - target.stats.def; logMsg = 'Raio Laser'; }
            
            damage = Math.max(1, Math.floor(damage));

            const nextUnits = units.map(u => {
              if (u.id === target.id) {
                 const newHp = Math.max(0, u.stats.hp - damage);
                 return { ...u, stats: { ...u.stats, hp: newHp, sp: Math.min(u.stats.maxSp || 100, (u.stats.sp || 0) + 15) } };
              }
              if (u.id === activeUnit.id) {
                 return { ...u, hasActed: true, stats: { ...u.stats, sp: (u.stats.sp || 0) - spCost } };
              }
              return u;
            });
            
            setUnits(nextUnits);
            addLog(\`\${logMsg} causou \${damage} crítico!\`);
            setSelectedAction(null);
            
            if (!checkWinCondition(nextUnits)) {
               setTimeout(nextTurn, 1000);
            }
        }
      } else {
         addLog('SP Insuficiente.');
      }
    }
  };

  `;

const newCode = code.substring(0, startIndex) + newFunc + code.substring(endIndex);
fs.writeFileSync('src/components/Combat.tsx', newCode);
