(() => {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");

  const palettes = [
    { base: "#7246a8", light: "#c49af1", transparent: "rgba(196,154,241,0)" },
    { base: "#8d57c7", light: "#d1adf5", transparent: "rgba(209,173,245,0)" },
    { base: "#5f45a5", light: "#a999ee", transparent: "rgba(169,153,238,0)" },
    { base: "#a54fba", light: "#e39aef", transparent: "rgba(227,154,239,0)" }
  ];

  const lightTexture = new Image();
  const tintedTextures = new Map();
  lightTexture.src = "./resources/textures/g_small_square.png";
  lightTexture.addEventListener("load", () => {
    palettes.forEach(palette => {
      const sprite = document.createElement("canvas");
      sprite.width = lightTexture.naturalWidth;
      sprite.height = lightTexture.naturalHeight;
      const spriteContext = sprite.getContext("2d");
      spriteContext.drawImage(lightTexture, 0, 0);
      spriteContext.globalCompositeOperation = "source-in";
      spriteContext.fillStyle = palette.light;
      spriteContext.fillRect(0, 0, sprite.width, sprite.height);
      tintedTextures.set(palette, sprite);
    });
  });

  let width = 0, height = 0, dpr = 1;
  let blocks = [];
  let last = performance.now();
  let animationFrame = 0;
  let cursorX = 0, cursorY = 0, cursorActive = false;
  let baseCount = 0;
  let lastBurstAt = 0;

  const random = (min, max) => min + Math.random() * (max - min);
  const randomSize = () => {
    const roll = Math.random();
    if (roll < .055) return random(92, 138);
    if (roll < .22) return random(48, 80);
    return random(16, 42);
  };

  const makeBlock = (initial = false) => ({
    x: Math.random() * width,
    y: initial ? Math.random() * height : height + random(30, 90),
    size: randomSize(),
    depth: random(.35, 1),
    rise: random(.025, .095),
    drift: random(-.025, .025),
    vx: 0,
    vy: 0,
    rotation: random(-.22, .22),
    rotationSpeed: random(-.00014, .00014),
    trail: [],
    lastTrailSample: 0,
    temporary: false,
    expiresAt: Infinity,
    expired: false,
    alpha: random(.14, .36),
    glow: 0,
    palette: palettes[Math.floor(Math.random() * palettes.length)]
  });

  const populate = () => {
    const area = width * height;
    const motionScale = reduceMotion.matches ? .55 : 1;
    const touchScale = coarsePointer.matches ? .7 : 1;
    const count = Math.round(
      Math.min(78, Math.max(34, area / 20500)) * motionScale * touchScale
    );
    baseCount = count;
    blocks = Array.from({ length: count }, () => makeBlock(true));
  };

  const spawnBurst = (x, y) => {
    if (reduceMotion.matches) return;

    const now = performance.now();
    const cooldown = coarsePointer.matches ? 190 : 130;
    if (now - lastBurstAt < cooldown) return;
    lastBurstAt = now;

    const maxExtra = coarsePointer.matches ? 18 : 30;
    const desired = coarsePointer.matches ? 5 : 7;
    let overflow = Math.max(0, blocks.length + desired - (baseCount + maxExtra));
    if (overflow) {
      blocks = blocks.filter(block => {
        if (block.temporary && overflow > 0) {
          overflow--;
          return false;
        }
        return true;
      });
    }
    const available = Math.max(0, baseCount + maxExtra - blocks.length);
    const amount = Math.min(available, desired);

    for (let i = 0; i < amount; i++) {
      const angle = (Math.PI * 2 * i) / amount + random(-.28, .28);
      const speed = random(.11, .25);
      const block = makeBlock(true);
      block.x = x + random(-8, 8);
      block.y = y + random(-8, 8);
      block.size = random(18, 52);
      block.vx = Math.cos(angle) * speed;
      block.vy = Math.sin(angle) * speed - random(.015, .055);
      block.alpha = random(.24, .42);
      block.glow = 1;
      block.trail = [{ x, y }];
      block.lastTrailSample = now;
      block.temporary = true;
      block.expiresAt = now + 8000;
      blocks.push(block);
    }
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    populate();
  };

  const drawTrail = p => {
    if (reduceMotion.matches) return;
    if (p.trail.length < 3) return;

    const points = [...p.trail, { x: p.x, y: p.y }];
    const tail = points[0];

    ctx.save();
    const gradient = ctx.createLinearGradient(tail.x, tail.y, p.x, p.y);
    gradient.addColorStop(0, p.palette.transparent);
    gradient.addColorStop(.68, p.palette.base);
    gradient.addColorStop(1, p.palette.light);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = Math.min(13, Math.max(3, p.size * .24));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = p.alpha * .48 + p.glow * .14;
    ctx.shadowColor = p.palette.light;
    ctx.shadowBlur = 10 + p.glow * 12;
    ctx.beginPath();
    ctx.moveTo(tail.x, tail.y);
    for (let i = 1; i < points.length - 1; i++) {
      const midpointX = (points[i].x + points[i + 1].x) * .5;
      const midpointY = (points[i].y + points[i + 1].y) * .5;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midpointX, midpointY);
    }
    const penultimate = points[points.length - 2];
    ctx.quadraticCurveTo(penultimate.x, penultimate.y, p.x, p.y);
    ctx.stroke();
    ctx.restore();
  };

  const drawBlock = p => {
    const s = p.size * 1.16;
    const sprite = tintedTextures.get(p.palette);

    ctx.save();
    ctx.globalAlpha = Math.min(1, p.alpha * 1.35 + p.glow * .35);
    ctx.shadowColor = p.palette.light;
    ctx.shadowBlur = 8 + p.glow * 14;
    if (sprite) {
      ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
    } else {
      ctx.fillStyle = p.palette.light;
      ctx.beginPath();
      ctx.arc(p.x, p.y, s * .38, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const pushFromCursor = (p, dt) => {
    p.glow = Math.max(0, p.glow - dt * .0025);
    if (!cursorActive || reduceMotion.matches || coarsePointer.matches) return;

    const dx = p.x - cursorX;
    const dy = p.y - cursorY;
    const radius = 175 + p.size;
    const distanceSquared = dx * dx + dy * dy;
    if (!distanceSquared || distanceSquared >= radius * radius) return;

    const distance = Math.sqrt(distanceSquared);
    const influence = 1 - distance / radius;
    const acceleration = influence * .00105 * dt * (.5 + p.depth * .5);
    p.vx += (dx / distance) * acceleration;
    p.vy += (dy / distance) * acceleration;
    p.glow = Math.max(p.glow, influence);
  };

  const updateBlock = (p, dt, now) => {
    if (!reduceMotion.matches) {
      pushFromCursor(p, dt);

      const damping = Math.pow(.975, dt / 16);
      p.vx *= damping;
      p.vy *= damping;
      p.x += (p.drift + p.vx) * dt;
      p.y += (-p.rise + p.vy) * dt;
      p.rotation += p.rotationSpeed * dt;

      if (now - p.lastTrailSample >= 28) {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 16) p.trail.shift();
        p.lastTrailSample = now;
      }

      if (p.temporary && (p.y < -p.size || now >= p.expiresAt)) {
        p.expired = true;
        return;
      }

      if (p.y < -70) Object.assign(p, makeBlock(false));
      if (p.x < -60) {
        p.x = width + 60;
        p.trail = [];
      }
      if (p.x > width + 60) {
        p.x = -60;
        p.trail = [];
      }
    }
  };

  const frame = now => {
    const dt = Math.min(now - last, 40);
    last = now;
    ctx.clearRect(0, 0, width, height);

    for (const block of blocks) {
      updateBlock(block, dt, now);
      if (block.expired) continue;
      drawTrail(block);
      drawBlock(block);
    }

    if (blocks.some(block => block.expired)) {
      blocks = blocks.filter(block => !block.expired);
    }

    ctx.globalAlpha = 1;
    animationFrame = requestAnimationFrame(frame);
  };

  const updateCursor = event => {
    if (coarsePointer.matches || reduceMotion.matches) return;
    cursorX = event.clientX;
    cursorY = event.clientY;
    cursorActive = true;
  };

  const clearCursor = () => {
    cursorActive = false;
  };

  const handleBackgroundPress = event => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest?.(".hero, .page-content, .lightbox")) return;
    spawnBurst(event.clientX, event.clientY);
  };

  const handleVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else if (!animationFrame) {
      last = performance.now();
      animationFrame = requestAnimationFrame(frame);
    }
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", updateCursor, { passive: true });
  document.addEventListener("pointerdown", handleBackgroundPress, { passive: true });
  document.documentElement.addEventListener("pointerleave", clearCursor, { passive: true });
  document.addEventListener("visibilitychange", handleVisibility);
  reduceMotion.addEventListener?.("change", resize);
  coarsePointer.addEventListener?.("change", resize);
  animationFrame = requestAnimationFrame(frame);
})();
