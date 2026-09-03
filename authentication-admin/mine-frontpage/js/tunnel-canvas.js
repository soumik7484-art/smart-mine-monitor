/**
 * MineGuard AI - Tunnel Background Atmosphere & Dust Particulate Physics
 * High-performance, lightweight Canvas & Parallax controller
 */

(function() {
  'use strict';

  // Canvas & Context
  const canvas = document.getElementById('dust-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const bgImage = document.querySelector('.tunnel-bg-image');

  let width = 0;
  let height = 0;
  let particles = [];
  const PARTICLE_COUNT = 65;

  // Mouse & Parallax tracking
  let mouseX = 0;
  let mouseY = 0;
  let targetParallaxX = 0;
  let targetParallaxY = 0;
  let currentParallaxX = 0;
  let currentParallaxY = 0;

  // Initialize Canvas dimensions
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  // Dust Particle Class
  class DustParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2.2 + 0.8; // 0.8px to 3px
      this.baseAlpha = Math.random() * 0.35 + 0.1; // 0.1 to 0.45
      this.alpha = this.baseAlpha;
      this.speedY = -(Math.random() * 0.35 + 0.15); // gentle upward drift
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.sinFrequency = Math.random() * 0.02 + 0.005;
      this.sinAmplitude = Math.random() * 0.8 + 0.2;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.angle = Math.random() * Math.PI * 2;
      
      // Color tone: faint technical slate/cyan in light theme or warm amber/cyan in dark theme
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const isCyan = Math.random() > 0.75;
      if (isDark) {
        this.color = isCyan ? 'rgba(56, 189, 248,' : 'rgba(214, 211, 209,';
      } else {
        this.color = isCyan ? 'rgba(2, 132, 199,' : 'rgba(100, 116, 139,';
      }
    }

    update() {
      this.angle += this.sinFrequency;
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.angle) * this.sinAmplitude;

      // Subtle alpha flicker
      this.alpha = this.baseAlpha + Math.sin(this.angle * 2) * 0.08;

      // Subtle interaction with mouse position
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100 * 0.6;
        this.x += (dx / dist) * force;
        this.y += (dy / dist) * force;
      }

      // Re-spawn if drifted out of bounds
      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset(false);
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color} ${Math.max(0.05, this.alpha)})`;
      ctx.fill();
    }
  }

  // Create particles
  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new DustParticle());
    }
  }

  // Render loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    // Smooth lerp parallax for underground tunnel background
    if (bgImage) {
      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;
      bgImage.style.transform = `scale(1.05) translate3d(${currentParallaxX}px, ${currentParallaxY}px, 0)`;
    }

    requestAnimationFrame(animate);
  }

  // Mouse move listener for spatial depth
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const normX = (e.clientX / window.innerWidth) - 0.5;
    const normY = (e.clientY / window.innerHeight) - 0.5;

    // Max 14px subtle shift for realistic tunnel perspective
    targetParallaxX = -normX * 18;
    targetParallaxY = -normY * 14;
  }, { passive: true });

  // Orientation support for mobile devices
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma !== null && e.beta !== null) {
      targetParallaxX = Math.min(Math.max(e.gamma, -25), 25) * -0.5;
      targetParallaxY = Math.min(Math.max(e.beta - 45, -25), 25) * -0.4;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  // Start
  resize();
  initParticles();
  requestAnimationFrame(animate);
})();
