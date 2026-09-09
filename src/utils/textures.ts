export const generateTextures = (tileSize: number): Record<string, HTMLCanvasElement> => {
  const createTile = (drawFunc: (ctx: CanvasRenderingContext2D) => void) => {
    const canvas = document.createElement('canvas');
    canvas.width = tileSize;
    canvas.height = tileSize;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      drawFunc(ctx);
    }
    return canvas;
  };

  const grass = createTile((ctx) => {
    // Rich green base
    ctx.fillStyle = '#397839';
    ctx.fillRect(0, 0, tileSize, tileSize);
    // Grass specks
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#4b8c4b' : '#285e28';
      const x = Math.floor(Math.random() * (tileSize / 2)) * 2;
      const y = Math.floor(Math.random() * (tileSize / 2)) * 2;
      ctx.fillRect(x, y, 2, 2);
    }
  });

  const mountain = createTile((ctx) => {
    // Base brown/gray
    ctx.fillStyle = '#423d30';
    ctx.fillRect(0, 0, tileSize, tileSize);
    
    // Draw mountain peak shapes
    ctx.fillStyle = '#595140'; // highlight
    ctx.beginPath();
    ctx.moveTo(tileSize / 2, 4);
    ctx.lineTo(tileSize - 2, tileSize - 2);
    ctx.lineTo(2, tileSize - 2);
    ctx.fill();

    ctx.fillStyle = '#2c271e'; // shadow
    ctx.beginPath();
    ctx.moveTo(tileSize / 2, 4);
    ctx.lineTo(tileSize - 2, tileSize - 2);
    ctx.lineTo(tileSize / 2, tileSize - 2);
    ctx.fill();

    // Noise/rocky texture
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#6a604c' : '#1e1a13';
      const x = Math.floor(Math.random() * (tileSize / 2)) * 2;
      const y = Math.floor(Math.random() * (tileSize / 2)) * 2;
      ctx.fillRect(x, y, 2, 2);
    }
  });

  const water = createTile((ctx) => {
    // Base deep blue
    ctx.fillStyle = '#254e99';
    ctx.fillRect(0, 0, tileSize, tileSize);
    
    // Wave lines
    ctx.fillStyle = '#366bcc';
    for (let i = 0; i < 15; i++) {
      const y = Math.floor(Math.random() * (tileSize / 2)) * 2;
      const w = Math.floor(Math.random() * (tileSize / 2)) + 6;
      const x = Math.floor(Math.random() * tileSize);
      ctx.fillRect(x, y, w, 2);
    }
  });

  const dungeon = createTile((ctx) => {
    // Draw mountain base first
    ctx.fillStyle = '#423d30';
    ctx.fillRect(0, 0, tileSize, tileSize);
    ctx.fillStyle = '#2c271e';
    ctx.beginPath();
    ctx.moveTo(tileSize/2, 4);
    ctx.lineTo(tileSize-2, tileSize-2);
    ctx.lineTo(tileSize/2, tileSize-2);
    ctx.fill();
    
    // Draw cave entrance
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(tileSize/2, tileSize - 2, tileSize/3, Math.PI, 0);
    ctx.fill();
    // Entrance trim
    ctx.strokeStyle = '#595140';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  
  const town = createTile((ctx) => {
    // Draw grass base
    ctx.fillStyle = '#397839';
    ctx.fillRect(0, 0, tileSize, tileSize);
    // Draw a castle/town icon
    ctx.fillStyle = '#d4d4d4'; // walls
    ctx.fillRect(8, 16, tileSize - 16, tileSize - 16);
    // Roofs
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(8, 16);
    ctx.lineTo(tileSize/2, 4);
    ctx.lineTo(tileSize - 8, 16);
    ctx.fill();
    // Door
    ctx.fillStyle = '#451a03';
    ctx.fillRect(tileSize/2 - 4, tileSize - 10, 8, 10);
    // Windows
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(12, 24, 4, 6);
    ctx.fillRect(tileSize - 16, 24, 4, 6);
  });

  return { grass, mountain, water, dungeon, town };
};
