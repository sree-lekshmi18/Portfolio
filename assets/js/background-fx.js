/**
 * ==============================================================================
 * AMBIENT BACKGROUND CANVAS - CRYSTAL MESH & PARTICLES
 * ==============================================================================
 * Renders a lightweight, high-performance ambient crystal particle network
 * with subtle silver caustics that gracefully reacts to cursor movement.
 */

(function () {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 140 };
  let isTabActive = true;
  let animationFrameId = null;

  // Respect user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initDimensions() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  class CrystalParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 1; // 1 to 3px
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.baseAlpha = Math.random() * 0.4 + 0.15;
      this.alpha = this.baseAlpha;
      this.pulseSpeed = Math.random() * 0.015 + 0.005;
      this.angle = Math.random() * Math.PI * 2;
      this.isFacet = Math.random() > 0.7; // Some particles are small faceted diamonds
    }

    update() {
      if (prefersReducedMotion) return;

      this.x += this.vx;
      this.y += this.vy;

      // Wrap around edges seamlessly
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Subtle breathing pulse
      this.angle += this.pulseSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.angle) * 0.12;

      // Mouse proximity interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 0.03;
          this.x -= dx * force;
          this.y -= dy * force;
          this.alpha = Math.min(0.9, this.alpha + 0.3);
        }
      }
    }

    draw() {
      ctx.save();
      ctx.fillStyle = `rgba(111, 78, 55, ${Math.max(0.08, this.alpha * 0.75)})`;
      ctx.shadowColor = 'rgba(141, 91, 76, 0.25)';
      ctx.shadowBlur = this.isFacet ? 5 : 2;

      if (this.isFacet) {
        // Draw small diamond/crystal shape
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size * 1.5);
        ctx.lineTo(this.x + this.size * 1.5, this.y);
        ctx.lineTo(this.x, this.y + this.size * 1.5);
        ctx.lineTo(this.x - this.size * 1.5, this.y);
        ctx.closePath();
        ctx.fill();
      } else {
        // Draw round star / crystal particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function createParticles() {
    particles = [];
    // Adjust density based on screen dimensions (around 45-75 particles)
    const particleCount = Math.floor((width * height) / 22000);
    const count = Math.min(Math.max(particleCount, 40), 85);
    for (let i = 0; i < count; i++) {
      particles.push(new CrystalParticle());
    }
  }

  function drawConnections() {
    const maxDist = 120;
    const maxDistSq = maxDist * maxDist;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          const alpha = (1 - dist / maxDist) * 0.12;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(111, 78, 55, ${alpha * 0.75})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    if (!isTabActive) return;

    ctx.clearRect(0, 0, width, height);

    drawConnections();

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  // Event Listeners
  window.addEventListener('resize', () => {
    initDimensions();
    createParticles();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isTabActive = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else {
      isTabActive = true;
      animate();
    }
  });

  // Initialization
  initDimensions();
  createParticles();
  animate();
})();
