(() => {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isTouch = matchMedia("(pointer: coarse)").matches;
  let width = 0, height = 0, dpr = 1, particles = [], last = performance.now();

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = reduceMotion.matches ? 18 : Math.min(52, Math.max(22, Math.floor(width * height / 26000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 5 + Math.random() * 15,
      speed: .06 + Math.random() * .18,
      drift: (Math.random() - .5) * .12,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - .5) * .0015,
      alpha: .08 + Math.random() * .14,
      type: Math.random() > .72 ? "diamond" : "block"
    }));
  };

  const drawBlock = p => {
    const s = p.size;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = "#9bc98b";
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.fillStyle = "#d8e8d1";
    ctx.globalAlpha = p.alpha * .45;
    ctx.fillRect(-s / 2, -s / 2, s, Math.max(2, s * .16));
    ctx.fillStyle = "#1b2b1b";
    ctx.globalAlpha = p.alpha * .25;
    ctx.fillRect(-s / 2, s / 2 - Math.max(2, s * .16), s, Math.max(2, s * .16));
    ctx.restore();
  };

  const drawDiamond = p => {
    const s = p.size;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = "#79aa6b";
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const frame = now => {
    const dt = Math.min(now - last, 40);
    last = now;
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      if (!reduceMotion.matches) {
        p.y -= p.speed * dt;
        p.x += p.drift * dt;
        p.rotation += p.rotationSpeed * dt;
        if (p.y < -30) { p.y = height + 30; p.x = Math.random() * width; }
        if (p.x < -40) p.x = width + 40;
        if (p.x > width + 40) p.x = -40;
      }
      p.type === "diamond" ? drawDiamond(p) : drawBlock(p);
    }
    requestAnimationFrame(frame);
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  if (!isTouch) requestAnimationFrame(frame);
  else {
    // Static particles on touch devices: lighter and more battery friendly.
    for (const p of particles) p.alpha *= .65;
    requestAnimationFrame(frame);
  }
})();