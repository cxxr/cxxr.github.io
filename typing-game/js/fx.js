// Visual effects: star particles, confetti explosions, dust puffs, and gentle screen shakes.

const fxLayer = () => document.getElementById('fx-layer') || document.body;

export const fx = {
  /**
   * Burst of colorful stars from a screen position (x, y) or element.
   */
  starBurst(x, y, count = 8) {
    const parent = fxLayer();
    const emojis = ['⭐', '✨', '🌟', '💛'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'fx-star';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
      const dist = 50 + Math.random() * 80;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const rot = (Math.random() - 0.5) * 120;

      el.style.setProperty('--dx', `${dx}px`);
      el.style.setProperty('--dy', `${dy}px`);
      el.style.setProperty('--rot', `${rot}deg`);

      parent.appendChild(el);
      setTimeout(() => el.remove(), 850);
    }
  },

  /**
   * Confetti celebration for victory / dinosaur hatch.
   */
  confetti(count = 50) {
    const parent = fxLayer();
    const colors = ['#ff6b6b', '#ffd43b', '#69db7c', '#4dabf7', '#da77f2', '#ffa94d'];
    const w = window.innerWidth;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.width = `${8 + Math.random() * 8}px`;
      el.style.height = `${10 + Math.random() * 12}px`;
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = '3px';
      el.style.left = `${Math.random() * w}px`;
      el.style.top = '-20px';
      el.style.zIndex = '50';
      el.style.pointerEvents = 'none';

      const duration = 1.8 + Math.random() * 1.6;
      const horizontalDrift = (Math.random() - 0.5) * 200;
      const spin = (Math.random() - 0.5) * 720;

      if (el.animate) {
        el.animate(
          [
            { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
            { transform: `translate(${horizontalDrift}px, ${window.innerHeight + 40}px) rotate(${spin}deg)`, opacity: 0.9 },
          ],
          {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }
        ).onfinish = () => el.remove();
      } else {
        setTimeout(() => el.remove(), 1000);
      }

      parent.appendChild(el);
    }
  },

  /**
   * Dust puff on dinosaur footsteps or egg crack.
   */
  dust(x, y) {
    const parent = fxLayer();
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.left = `${x - 12}px`;
    el.style.top = `${y - 12}px`;
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(200,200,200,0) 70%)';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '30';

    if (el.animate) {
      el.animate(
        [
          { transform: 'scale(0.4)', opacity: 0.8 },
          { transform: 'scale(2.2)', opacity: 0 },
        ],
        { duration: 450, easing: 'ease-out' }
      ).onfinish = () => el.remove();
    } else {
      setTimeout(() => el.remove(), 450);
    }

    parent.appendChild(el);
  },

  /**
   * Gentle screen nudge on wrong key.
   */
  shake(el = document.getElementById('stage')) {
    if (!el || !el.animate) return;
    el.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 240, easing: 'ease-in-out' }
    );
  },
};
