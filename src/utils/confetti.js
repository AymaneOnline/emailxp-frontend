// Lightweight confetti utility without external dependencies.
// Usage: import { launchConfetti } from '../utils/confetti'; launchConfetti();

const DEFAULT_PARTICLES = 120;

function randomRange(min, max) { return Math.random() * (max - min) + min; }

export function launchConfetti({
  particleCount = DEFAULT_PARTICLES,
  spread = 60,
  decay = 0.91,
  startVelocity = 18,
  gravity = 0.5,
  ticks = 240,
  colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#ec4899'],
  shapes = ['square', 'circle'],
} = {}) {
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = 9999;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const dpr = window.devicePixelRatio || 1;
  function resize() { canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr; ctx.scale(dpr, dpr); }
  resize();
  window.addEventListener('resize', resize, { once: true });

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const particles = Array.from({ length: particleCount }).map(() => {
    const angle = (Math.random() - 0.5) * spread * (Math.PI / 180);
    const velocity = startVelocity * (0.8 + Math.random() * 0.4);
    return {
      x: centerX,
      y: centerY,
      vx: Math.sin(angle) * velocity,
      vy: -Math.cos(angle) * velocity,
      size: randomRange(4, 8),
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: randomRange(0, Math.PI * 2),
      rotationSpeed: randomRange(-0.2, 0.2),
      life: ticks,
    };
  });

  function drawParticle(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    if (p.shape === 'circle') {
      ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    }
    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity * 0.1;
      p.vx *= decay;
      p.vy *= decay;
      p.rotation += p.rotationSpeed;
      p.life -= 1;
    });
    particles.filter(p => p.life > 0).forEach(drawParticle);
    if (particles.some(p => p.life > 0)) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }
  requestAnimationFrame(frame);
}
