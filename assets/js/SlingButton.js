/**
 * ==============================================================================
 * SLING BUTTON COMPONENT (REACT BITS)
 * ==============================================================================
 * Pure Vanilla JavaScript implementation with physics-based rubberband slingshot,
 * tension arcs, particle bursts, and spring recoil return.
 */

(function () {
  const GAP = 4;
  const SLOP = { fine: 4, coarse: 8 };
  const FINGER_MAX = 3000;
  const HAND_MAX = 6000;
  const CANCEL = 0.5;
  const POWER_CAP = 1.5;
  const DOT_MS = 300;
  const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const rubberband = (o, dim, c = 0.55) => (o * dim * c) / (dim + c * Math.abs(o));

  function createSlingButton(container, options = {}) {
    const onSend = options.onSend || (() => {});
    const padColor = options.padColor || '#F5F5F7';
    const iconColor = options.iconColor || '#050505';
    const accentColor = options.accentColor || '#C8D0DA';
    const wellColor = options.wellColor || '#27272A';
    const bandColor = options.bandColor || '#52525B';
    const size = options.size || 56;
    const strokeWidth = options.strokeWidth || 3;
    const armAt = options.armAt || 48;
    const maxPull = options.maxPull || 160;
    const launchSpeed = options.launchSpeed || 2600;
    const recoil = options.recoil !== undefined ? options.recoil : 0.2;
    const flight = options.flight || 120;
    const particles = options.particles !== undefined ? options.particles : 14;
    const spread = options.spread || 60;
    const axis = options.axis || 'any';
    const tapSends = options.tapSends !== undefined ? options.tapSends : true;
    const disabled = options.disabled || false;
    const ariaLabel = options.ariaLabel || 'Launch to Top';

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const R = maxPull;
    const ARM = Math.min(armAt, 0.8 * R);
    const wellR = size / 2 + GAP + strokeWidth;
    const padR = size / 2 - strokeWidth / 2;
    const arcR = wellR;
    const H = wellR + strokeWidth + 2;
    const DOT = Math.max(6, Math.round(size / 7));
    const count = Math.max(0, Math.round(particles));

    let px = 0;
    let py = 0;
    let held = false;
    let armed = false;
    let sent = false;
    let power = 0;
    let grip = null;
    let dir = { ux: 0, uy: -1 };
    let armedState = false;
    let dotPending = false;
    let dotTimer = null;
    let skipClick = false;
    let animRaf = 0;

    // Create Root Element
    const root = document.createElement('span');
    root.className = `sling-button ${options.className || ''}`.trim();
    root.style.setProperty('--sl-size', `${size}px`);
    root.style.setProperty('--sl-svg', `${2 * H}px`);
    root.style.setProperty('--sl-pad', padColor);
    root.style.setProperty('--sl-icon', iconColor);
    root.style.setProperty('--sl-accent', accentColor);
    root.style.setProperty('--sl-well', wellColor);
    root.style.setProperty('--sl-band', bandColor);
    root.style.setProperty('--sl-stroke', `${strokeWidth}px`);
    root.style.setProperty('--sl-dot', `${DOT}px`);

    // SVG Layer
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'sling-button__fx');
    svg.setAttribute('viewBox', `${-H} ${-H} ${2 * H} ${2 * H}`);
    svg.setAttribute('aria-hidden', 'true');

    const fxG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    fxG.setAttribute('class', 'sling-button__tension');
    fxG.style.opacity = '0';

    const bandPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bandPath.setAttribute('class', 'sling-button__band');

    const hotPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hotPath.setAttribute('class', 'sling-button__band sling-button__band--hot');

    fxG.appendChild(bandPath);
    fxG.appendChild(hotPath);

    const wellCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    wellCircle.setAttribute('class', 'sling-button__well');
    wellCircle.setAttribute('r', wellR);

    const arcCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    arcCircle.setAttribute('class', 'sling-button__arc');
    arcCircle.setAttribute('r', arcR);
    arcCircle.setAttribute('pathLength', '1');
    arcCircle.setAttribute('stroke-dasharray', '0 1');
    arcCircle.style.opacity = '0';

    svg.appendChild(fxG);
    svg.appendChild(wellCircle);
    svg.appendChild(arcCircle);
    root.appendChild(svg);

    // Particle Dots
    const dotEls = [];
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = 'sling-button__dot';
      dot.setAttribute('aria-hidden', 'true');
      root.appendChild(dot);
      dotEls.push(dot);
    }

    // Move Container & Pad
    const moveSpan = document.createElement('span');
    moveSpan.className = 'sling-button__move';

    const pad = document.createElement('button');
    pad.type = 'button';
    pad.className = 'sling-button__pad';
    pad.setAttribute('aria-label', ariaLabel);
    if (disabled) pad.setAttribute('aria-disabled', 'true');

    const face = document.createElement('span');
    face.className = 'sling-button__face';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'sling-button__icon';
    iconSpan.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(size * 0.45)}" height="${Math.round(size * 0.45)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>
      </svg>
    `;

    face.appendChild(iconSpan);
    pad.appendChild(face);
    moveSpan.appendChild(pad);
    root.appendChild(moveSpan);

    const srSpan = document.createElement('span');
    srSpan.className = 'sling-button__sr';
    srSpan.textContent = 'Press Enter to launch to top, or pull away and release.';
    root.appendChild(srSpan);

    container.appendChild(root);

    // Methods
    const setPadTransform = (x, y) => {
      moveSpan.style.transform = `translate(${x}px, ${y}px)`;
    };

    const aimIcon = (ux, uy, dist) => {
      const angle = (Math.atan2(-uy, -ux) * 180) / Math.PI + 90;
      iconSpan.style.transition = 'none';
      iconSpan.style.transform = `rotate(${angle * clamp(dist / 12, 0, 1)}deg)`;
    };

    const relaxIcon = () => {
      iconSpan.style.transition = reduce ? 'none' : 'transform 360ms cubic-bezier(0.23, 1, 0.32, 1)';
      iconSpan.style.transform = 'rotate(0deg)';
    };

    const launchDot = () => {
      dotPending = false;
      clearTimeout(dotTimer);
      const { ux, uy } = dir;
      relaxIcon();
      const base = Math.atan2(-uy, -ux);
      const cone = (spread * Math.PI) / 180;
      const push = 0.85 + 0.35 * power;

      dotEls.forEach((dot, i) => {
        const lead = i === 0;
        const angle = base + (lead ? 0 : (Math.random() + Math.random() - 1) * (cone / 2));
        const cx = Math.cos(angle);
        const cy = Math.sin(angle);
        const reach = (lead ? flight : flight * (0.3 + Math.random())) * push;
        const drift = lead ? 0 : (Math.random() - 0.5) * flight * 0.4;
        const scale = lead ? 1 : 0.3 + Math.random() * 0.6;
        const shrink = lead ? 0.6 : scale * (0.2 + Math.random() * 0.4);
        const duration = lead ? DOT_MS : DOT_MS * (0.7 + Math.random());
        const delay = lead ? 0 : Math.random() * 70;
        const to = wellR + reach;

        dot.animate(
          [
            { transform: `translate(${cx * wellR}px, ${cy * wellR}px) scale(${scale})` },
            { transform: `translate(${cx * to - cy * drift}px, ${cy * to + cx * drift}px) scale(${shrink})` }
          ],
          { duration, delay, easing: EASE_OUT, fill: 'none' }
        );

        dot.animate(
          [
            { opacity: 1, offset: 0 },
            { opacity: 1, offset: 0.55 },
            { opacity: 0, offset: 1 }
          ],
          { duration, delay, easing: 'linear', fill: 'none' }
        );
      });
    };

    const paint = () => {
      const { ux, uy } = dir;
      const proj = px * ux + py * uy;
      const p = clamp(proj / ARM, 0, 1);
      const dist = Math.hypot(px, py);

      let d = '';
      if (dist > 0.5) {
        const a = Math.atan2(py, px);
        const b = Math.acos(clamp((wellR - padR) / dist, -1, 1));
        d = [a + b, a - b]
          .map(t => {
            const cx = Math.cos(t);
            const cy = Math.sin(t);
            return `M${(wellR * cx).toFixed(2)},${(wellR * cy).toFixed(2)}L${(px + padR * cx).toFixed(2)},${(py + padR * cy).toFixed(2)}`;
          })
          .join('');
      }

      bandPath.setAttribute('d', d);
      hotPath.setAttribute('d', d);
      hotPath.style.opacity = String(p);
      fxG.style.opacity = String(clamp(proj / 6, 0, 1));
      arcCircle.setAttribute('stroke-dasharray', `${p} ${1 - p}`);
      arcCircle.setAttribute('stroke-dashoffset', String(p / 2));
      arcCircle.style.opacity = p > 0.01 ? '1' : '0';
      arcCircle.setAttribute('transform', `rotate(${(Math.atan2(-uy, -ux) * 180) / Math.PI})`);

      if (grip) aimIcon(ux, uy, dist);
      if (dotPending && proj <= size / 4) launchDot();
    };

    // Smooth Spring physics simulation for return bounce
    const settle = v0 => {
      if (reduce) {
        px = 0;
        py = 0;
        setPadTransform(0, 0);
        paint();
        return;
      }

      cancelAnimationFrame(animRaf);
      let currentX = px;
      let currentY = py;
      let vx = v0.x;
      let vy = v0.y;
      const k = 220; // spring tension
      const damp = 16 * (1 - recoil * 0.35); // damping
      let lastTime = performance.now();

      const step = now => {
        const dt = Math.min((now - lastTime) / 1000, 0.035);
        lastTime = now;

        const ax = -k * currentX - damp * vx;
        const ay = -k * currentY - damp * vy;

        vx += ax * dt;
        vy += ay * dt;
        currentX += vx * dt;
        currentY += vy * dt;

        px = currentX;
        py = currentY;
        setPadTransform(px, py);
        paint();

        if (Math.hypot(currentX, currentY) > 0.2 || Math.hypot(vx, vy) > 5) {
          animRaf = requestAnimationFrame(step);
        } else {
          px = 0;
          py = 0;
          setPadTransform(0, 0);
          paint();
        }
      };

      animRaf = requestAnimationFrame(step);
    };

    // Pointer Event Handlers
    const onPointerDown = e => {
      if (disabled || grip || e.button !== 0) return;
      const rect = root.getBoundingClientRect();
      const scale = rect.width / (root.offsetWidth || rect.width) || 1;
      cancelAnimationFrame(animRaf);

      const dNow = Math.hypot(px, py);
      const dClamped = Math.min(dNow, 0.95 * R);
      const rawNow = dNow > 0.5 ? (R * dClamped) / (R - dClamped) : 0;

      grip = {
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        scale,
        moved: false,
        hist: [],
        rawOrigin: dNow > 0.5 ? { x: (rawNow * px) / dNow, y: (rawNow * py) / dNow } : { x: 0, y: 0 },
        slop: e.pointerType === 'touch' ? SLOP.coarse : SLOP.fine
      };

      try {
        pad.setPointerCapture(e.pointerId);
      } catch {}

      held = true;
      pad.setAttribute('data-held', '');
    };

    const onPointerMove = e => {
      if (!grip || grip.id !== e.pointerId) return;
      const dx = (e.clientX - grip.startX) / grip.scale;
      const dy = (e.clientY - grip.startY) / grip.scale;
      let rx = grip.rawOrigin.x + dx;
      let ry = grip.rawOrigin.y + dy;

      if (axis === 'horizontal') ry = rubberband(ry, size / 4);
      else if (axis === 'vertical') rx = rubberband(rx, size / 4);

      if (!grip.moved && Math.hypot(dx, dy) > grip.slop) grip.moved = true;

      const raw = Math.hypot(rx, ry);
      if (raw < 0.01) return;

      const d = (R * raw) / (R + raw);
      const ux = rx / raw;
      const uy = ry / raw;
      dir = { ux, uy };

      px = d * ux;
      py = d * uy;
      setPadTransform(px, py);
      paint();

      const t = performance.now();
      grip.hist.push({ x: px, y: py, t });
      while (grip.hist.length > 4 || t - grip.hist[0].t > 80) grip.hist.shift();

      const isArmed = d >= ARM;
      if (isArmed !== armedState) {
        armedState = isArmed;
        if (isArmed) {
          root.setAttribute('data-armed', '');
          pad.setAttribute('data-armed', '');
        } else {
          root.removeAttribute('data-armed');
          pad.removeAttribute('data-armed');
        }
      }
    };

    const release = (pointerId, cancelled) => {
      if (!grip || grip.id !== pointerId) return;
      const g = grip;
      grip = null;
      skipClick = true;

      try {
        pad.releasePointerCapture(pointerId);
      } catch {}

      const d = Math.hypot(px, py);
      const p = d / ARM;
      const { ux, uy } = dir;
      let vx = 0;
      let vy = 0;

      if (!cancelled && g.hist.length > 1) {
        const a = g.hist[0];
        const b = g.hist[g.hist.length - 1];
        const dt = b.t - a.t;
        if (dt > 0 && performance.now() - b.t < 50) {
          vx = ((b.x - a.x) / dt) * 1000;
          vy = ((b.y - a.y) / dt) * 1000;
        }
      }

      const fm = Math.hypot(vx, vy);
      if (fm > FINGER_MAX) {
        vx *= FINGER_MAX / fm;
        vy *= FINGER_MAX / fm;
      }

      if (!g.moved) {
        relaxIcon();
        if (tapSends && !cancelled) onSend();
      } else {
        const fire = armedState && !cancelled;
        const launch = fire ? launchSpeed * Math.min(p, POWER_CAP) : CANCEL * launchSpeed * Math.min(p, 1);
        let v0x = vx - ux * launch;
        let v0y = vy - uy * launch;
        const m = Math.hypot(v0x, v0y);
        if (m > HAND_MAX) {
          v0x *= HAND_MAX / m;
          v0y *= HAND_MAX / m;
        }

        if (!fire) relaxIcon();
        if (fire) {
          onSend();
          if (reduce) {
            root.setAttribute('data-sent', '');
            setTimeout(() => root.removeAttribute('data-sent'), 200);
          } else {
            power = clamp((Math.min(p, POWER_CAP) - 1) / (POWER_CAP - 1), 0, 1);
            dotPending = true;
            dotTimer = setTimeout(launchDot, 150);
          }
        }

        settle({ x: v0x, y: v0y });
      }

      armedState = false;
      root.removeAttribute('data-armed');
      pad.removeAttribute('data-armed');
      pad.removeAttribute('data-held');
    };

    pad.addEventListener('pointerdown', onPointerDown);
    pad.addEventListener('pointermove', onPointerMove);
    pad.addEventListener('pointerup', e => release(e.pointerId, false));
    pad.addEventListener('pointercancel', e => release(e.pointerId, true));
    pad.addEventListener('lostpointercapture', e => release(e.pointerId, true));

    pad.addEventListener('keydown', e => {
      if (e.key === 'Escape' && grip) {
        release(grip.id, true);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSend();
      }
    });

    pad.addEventListener('click', () => {
      if (skipClick) {
        skipClick = false;
        return;
      }
      if (!disabled) onSend();
    });

    return {
      element: root,
      destroy: () => {
        cancelAnimationFrame(animRaf);
        clearTimeout(dotTimer);
        root.remove();
      }
    };
  }

  // Global exposure
  window.createSlingButton = createSlingButton;
})();
