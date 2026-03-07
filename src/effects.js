export class Particle {
  constructor(x, y, color, vx, vy, life) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.size = Math.random() * 3 + 1;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }
  draw(ctx, cameraX, cameraY) {
    ctx.save();
    let alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y - cameraY, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export const particles = [];

export function createExplosion(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 100 + 50;
    particles.push(new Particle(
      x, y, color,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      Math.random() * 0.5 + 0.3
    ));
  }
}

export function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update(dt);
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }
}

export function drawParticles(ctx, cameraX, cameraY) {
  for (const p of particles) {
    p.draw(ctx, cameraX, cameraY);
  }
}
