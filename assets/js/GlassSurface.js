/**
 * ==============================================================================
 * GLASS SURFACE COMPONENT (REACT BITS - VANILLA JS ADAPTATION)
 * Optical Refraction, Chromatic Aberration & Frosted Crystal Glass
 * ==============================================================================
 */

(function (window, document) {
  'use strict';

  const FAR = 1e20;

  const GLASS_VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

  const GLASS_FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uBackdrop;
uniform sampler2D uMap;
uniform vec2 uCanvas;
uniform vec2 uSize;
uniform vec2 uOrigin;
uniform vec2 uStep;
uniform vec3 uScale;
uniform ivec2 uChannel;
uniform float uSpread;
uniform float uLod;
uniform float uSaturation;
out vec4 outColor;

vec4 bend(vec2 p) {
  vec4 map = texture(uMap, clamp(p / uSize, 0.0, 1.0));
  vec2 shift = vec2(map[uChannel.x], map[uChannel.y]) - 0.5;
  vec2 base = uOrigin + p * uStep;
  vec4 red = textureLod(uBackdrop, base + shift * uScale.r * uStep, uLod);
  vec4 green = textureLod(uBackdrop, base + shift * uScale.g * uStep, uLod);
  vec4 blue = textureLod(uBackdrop, base + shift * uScale.b * uStep, uLod);
  return vec4(red.r, green.g, blue.b, (red.a + green.a + blue.a) / 3.0);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y) / uCanvas * uSize;
  vec4 color = vec4(0.0);
  if (uSpread < 0.05) {
    color = bend(p);
  } else {
    float total = 0.0;
    for (int j = -2; j <= 2; j++) {
      for (int i = -2; i <= 2; i++) {
        vec2 offset = vec2(float(i), float(j)) * uSpread * 0.8;
        float weight = exp(-dot(offset, offset) / (2.0 * uSpread * uSpread));
        color += bend(p + offset) * weight;
        total += weight;
      }
    }
    color /= total;
  }
  vec3 rgb = color.a > 0.0 ? color.rgb / color.a : vec3(0.0);
  float s = uSaturation;
  mat3 tone = mat3(
    0.213 + 0.787 * s, 0.213 - 0.213 * s, 0.213 - 0.213 * s,
    0.715 - 0.715 * s, 0.715 + 0.285 * s, 0.715 - 0.715 * s,
    0.072 - 0.072 * s, 0.072 - 0.072 * s, 0.072 + 0.928 * s
  );
  rgb = clamp(tone * rgb, 0.0, 1.0);
  outColor = vec4(rgb * color.a, color.a);
}`;

  const CHANNELS = { R: 0, G: 1, B: 2, A: 3 };

  let idCounter = 0;
  function uniqueGlassId() {
    idCounter += 1;
    return `glass-${Date.now().toString(36)}-${idCounter}`;
  }

  const compileGlass = gl => {
    const make = (type, source) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
      gl.deleteShader(shader);
      return null;
    };
    const vertex = make(gl.VERTEX_SHADER, GLASS_VERTEX);
    const fragment = make(gl.FRAGMENT_SHADER, GLASS_FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
    gl.deleteProgram(program);
    return null;
  };

  const resolveBackdrop = backdrop => {
    if (typeof window === 'undefined' || !backdrop) return null;
    if (typeof backdrop === 'string') {
      const el = document.querySelector(backdrop);
      if (el instanceof HTMLImageElement || el instanceof HTMLVideoElement || el instanceof HTMLCanvasElement) {
        return el;
      }
    }
    const node = typeof backdrop === 'object' && 'current' in backdrop ? backdrop.current : backdrop;
    if (node instanceof HTMLImageElement || node instanceof HTMLVideoElement || node instanceof HTMLCanvasElement) {
      return node;
    }
    return null;
  };

  const sourceSize = node => {
    if (node instanceof HTMLImageElement) return [node.naturalWidth || node.width, node.naturalHeight || node.height];
    if (node instanceof HTMLVideoElement) return [node.videoWidth, node.videoHeight];
    return [node.width, node.height];
  };

  const placeAxis = (value, free) => {
    if (!value) return free / 2;
    if (value.endsWith('%')) return (parseFloat(value) / 100) * free;
    const px = parseFloat(value);
    return Number.isFinite(px) ? px : free / 2;
  };

  const contentBox = node => {
    const rect = node.getBoundingClientRect();
    const [naturalWidth, naturalHeight] = sourceSize(node);
    const style = getComputedStyle(node);
    const fit = style.objectFit || 'fill';
    if (!naturalWidth || !naturalHeight || fit === 'fill') {
      return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
    }
    const contain = Math.min(rect.width / naturalWidth, rect.height / naturalHeight);
    const cover = Math.max(rect.width / naturalWidth, rect.height / naturalHeight);
    const scale = fit === 'cover' ? cover : fit === 'contain' ? contain : fit === 'none' ? 1 : Math.min(1, contain);
    const width = naturalWidth * scale;
    const height = naturalHeight * scale;
    const [px, py] = (style.objectPosition || '50% 50%').split(' ');
    return {
      x: rect.left + placeAxis(px, rect.width - width),
      y: rect.top + placeAxis(py ?? px, rect.height - height),
      width,
      height
    };
  };

  const distanceLine = (f, d, v, z, n) => {
    let k = 0;
    v[0] = 0;
    z[0] = -FAR;
    z[1] = FAR;
    for (let q = 1; q < n; q++) {
      let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) {
        k--;
        s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      }
      k++;
      v[k] = q;
      z[k] = s;
      z[k + 1] = FAR;
    }
    k = 0;
    for (let q = 0; q < n; q++) {
      while (z[k + 1] < q) k++;
      d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
    }
  };

  const distanceGrid = (grid, w, h) => {
    const n = Math.max(w, h);
    const f = new Float64Array(n);
    const d = new Float64Array(n);
    const v = new Int32Array(n);
    const z = new Float64Array(n + 1);
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) f[y] = grid[y * w + x];
      distanceLine(f, d, v, z, h);
      for (let y = 0; y < h; y++) grid[y * w + x] = d[y];
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) f[x] = grid[y * w + x];
      distanceLine(f, d, v, z, w);
      for (let x = 0; x < w; x++) grid[y * w + x] = d[x];
    }
  };

  const blurLine = (src, dst, offset, stride, n, r) => {
    const scale = 1 / (2 * r + 1);
    let sum = src[offset] * (r + 1);
    for (let i = 1; i <= r; i++) sum += src[offset + Math.min(i, n - 1) * stride];
    for (let i = 0; i < n; i++) {
      dst[offset + i * stride] = sum * scale;
      sum += src[offset + Math.min(i + r + 1, n - 1) * stride] - src[offset + Math.max(i - r, 0) * stride];
    }
  };

  const blurGrid = (grid, w, h, r) => {
    const tmp = new Float32Array(w * h);
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 0; y < h; y++) blurLine(grid, tmp, y * w, 1, w, r);
      for (let x = 0; x < w; x++) blurLine(tmp, grid, x, w, h, r);
    }
  };

  const settle = x => 1 / (1 + Math.exp(-1.702 * x));

  const paint = (w, h, fill) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext('2d');
    const image = context.createImageData(w, h);
    fill(image.data);
    context.putImageData(image, 0, 0);
    return canvas.toDataURL();
  };

  const shade = (depth, w, h, falloff) =>
    paint(w, h, data => {
      data.fill(255);
      for (let i = 0; i < w * h; i++) data[i * 4 + 3] = 255 * (1 - falloff(depth[i]));
    });

  const traceShape = (image, width, height, ratio) => {
    const naturalWidth = image.naturalWidth || width;
    const naturalHeight = image.naturalHeight || height;
    const fit = Math.min(width / naturalWidth, height / naturalHeight);
    const box = {
      x: (width - naturalWidth * fit) / 2,
      y: (height - naturalHeight * fit) / 2,
      width: naturalWidth * fit,
      height: naturalHeight * fit
    };
    const w = Math.max(2, Math.round(width * ratio));
    const h = Math.max(2, Math.round(height * ratio));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, box.x * ratio, box.y * ratio, box.width * ratio, box.height * ratio);
    const pixels = context.getImageData(0, 0, w, h).data;
    const outside = new Float32Array(w * h);
    const inside = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const edge = 0.5 - pixels[i * 4 + 3] / 255;
      outside[i] = edge >= 0.5 ? FAR : Math.max(edge, 0) ** 2;
      inside[i] = edge <= -0.5 ? FAR : Math.min(edge, 0) ** 2;
    }
    distanceGrid(outside, w, h);
    distanceGrid(inside, w, h);
    const depth = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) depth[i] = (Math.sqrt(inside[i]) - Math.sqrt(outside[i])) / ratio;
    return {
      box,
      depth,
      w,
      h,
      ratio,
      line: shade(depth, w, h, t => settle(t - 1)),
      glow: shade(depth, w, h, t => settle((t - 4) / 5))
    };
  };

  const bendShape = (trace, edge, softness, calm, level) => {
    const { depth, w, h, ratio } = trace;
    const reach = edge + softness * 2;
    const field = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) field[i] = Math.min(Math.max(depth[i], -6), reach);
    blurGrid(field, w, h, Math.max(1, Math.round(Math.max(1.5, softness * 0.35) * ratio)));
    return paint(w, h, data => {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          const dx = field[i + (x < w - 1 ? 1 : 0)] - field[i - (x > 0 ? 1 : 0)];
          const dy = field[i + (y < h - 1 ? w : 0)] - field[i - (y > 0 ? w : 0)];
          const still = calm * settle((depth[i] - edge) / softness);
          const bend = (1 - still) * ratio * 0.25;
          const shift = still * (level - 0.5);
          data[i * 4] = 255 * (0.5 + dx * bend + shift);
          data[i * 4 + 1] = 255 * (0.5 + dy * bend + shift);
          data[i * 4 + 2] = 255 * (0.5 + shift);
          data[i * 4 + 3] = 255;
        }
      }
    });
  };

  const supportsSVGFilters = filterId => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;
    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    if (isWebkit || isFirefox) return false;
    const div = document.createElement('div');
    div.style.backdropFilter = `url(#${filterId})`;
    return div.style.backdropFilter !== '';
  };

  /**
   * Core GlassSurface Engine
   */
  function createGlassSurface(container, opts = {}) {
    // If container is actually options (flexible usage)
    if (container && !(container instanceof HTMLElement) && typeof container === 'object' && !opts.width) {
      opts = container;
      container = null;
    }

    const {
      width,
      height,
      borderRadius = 20,
      borderWidth = 0.07,
      brightness = 50,
      opacity = 0.93,
      blur = 11,
      displace = 0,
      backgroundOpacity = 0.03,
      saturation = 1,
      distortionScale = -180,
      redOffset = 0,
      greenOffset = 10,
      blueOffset = 20,
      xChannel = 'R',
      yChannel = 'G',
      mixBlendMode = 'difference',
      refraction = true,
      renderer = 'auto',
      backdrop = null,
      shape = null,
      className = '',
      style = {},
      asCard = false
    } = opts;

    const uniqueId = uniqueGlassId();
    const filterId = `glass-filter-${uniqueId}`;
    const redGradId = `red-grad-${uniqueId}`;
    const blueGradId = `blue-grad-${uniqueId}`;
    const softId = `soft-${uniqueId}`;

    const svgSupported = supportsSVGFilters(filterId);
    const hasBackdrop = Boolean(backdrop);
    const useWebGL = refraction && hasBackdrop && (renderer === 'webgl' || (renderer === 'auto' && !svgSupported));
    const useSVG = !useWebGL && svgSupported && refraction;
    const useFallback = !useWebGL && !useSVG;

    const el = container || document.createElement('div');
    el.classList.add('glass-surface');
    if (asCard) el.classList.add('as-card');
    if (useWebGL) el.classList.add('glass-surface--webgl');
    else if (useSVG) el.classList.add('glass-surface--svg');
    else el.classList.add('glass-surface--fallback');

    if (className) {
      className.split(' ').forEach(cls => cls && el.classList.add(cls));
    }

    if (width) el.style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) el.style.height = typeof height === 'number' ? `${height}px` : height;
    el.style.borderRadius = `${borderRadius}px`;
    el.style.setProperty('--glass-frost', backgroundOpacity);
    el.style.setProperty('--glass-saturation', saturation);
    el.style.setProperty('--filter-id', `url(#${filterId})`);

    Object.assign(el.style, style);

    // Create SVG filter
    const svgNs = 'http://www.w3.org/2000/svg';
    const svgEl = document.createElementNS(svgNs, 'svg');
    svgEl.setAttribute('class', 'glass-surface__filter');
    svgEl.setAttribute('xmlns', svgNs);

    const defsEl = document.createElementNS(svgNs, 'defs');
    const filterEl = document.createElementNS(svgNs, 'filter');
    filterEl.setAttribute('id', filterId);
    filterEl.setAttribute('color-interpolation-filters', 'sRGB');
    filterEl.setAttribute('x', '0%');
    filterEl.setAttribute('y', '0%');
    filterEl.setAttribute('width', '100%');
    filterEl.setAttribute('height', '100%');

    const feImage = document.createElementNS(svgNs, 'feImage');
    feImage.setAttribute('x', '0');
    feImage.setAttribute('y', '0');
    feImage.setAttribute('width', '100%');
    feImage.setAttribute('height', '100%');
    feImage.setAttribute('preserveAspectRatio', 'none');
    feImage.setAttribute('result', 'map');

    // Displacement channels
    const feDispRed = document.createElementNS(svgNs, 'feDisplacementMap');
    feDispRed.setAttribute('in', 'SourceGraphic');
    feDispRed.setAttribute('in2', 'map');
    feDispRed.setAttribute('scale', (distortionScale + redOffset).toString());
    feDispRed.setAttribute('xChannelSelector', xChannel);
    feDispRed.setAttribute('yChannelSelector', yChannel);
    feDispRed.setAttribute('result', 'dispRed');

    const feColorRed = document.createElementNS(svgNs, 'feColorMatrix');
    feColorRed.setAttribute('in', 'dispRed');
    feColorRed.setAttribute('type', 'matrix');
    feColorRed.setAttribute('values', '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0');
    feColorRed.setAttribute('result', 'red');

    const feDispGreen = document.createElementNS(svgNs, 'feDisplacementMap');
    feDispGreen.setAttribute('in', 'SourceGraphic');
    feDispGreen.setAttribute('in2', 'map');
    feDispGreen.setAttribute('scale', (distortionScale + greenOffset).toString());
    feDispGreen.setAttribute('xChannelSelector', xChannel);
    feDispGreen.setAttribute('yChannelSelector', yChannel);
    feDispGreen.setAttribute('result', 'dispGreen');

    const feColorGreen = document.createElementNS(svgNs, 'feColorMatrix');
    feColorGreen.setAttribute('in', 'dispGreen');
    feColorGreen.setAttribute('type', 'matrix');
    feColorGreen.setAttribute('values', '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0');
    feColorGreen.setAttribute('result', 'green');

    const feDispBlue = document.createElementNS(svgNs, 'feDisplacementMap');
    feDispBlue.setAttribute('in', 'SourceGraphic');
    feDispBlue.setAttribute('in2', 'map');
    feDispBlue.setAttribute('scale', (distortionScale + blueOffset).toString());
    feDispBlue.setAttribute('xChannelSelector', xChannel);
    feDispBlue.setAttribute('yChannelSelector', yChannel);
    feDispBlue.setAttribute('result', 'dispBlue');

    const feColorBlue = document.createElementNS(svgNs, 'feColorMatrix');
    feColorBlue.setAttribute('in', 'dispBlue');
    feColorBlue.setAttribute('type', 'matrix');
    feColorBlue.setAttribute('values', '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0');
    feColorBlue.setAttribute('result', 'blue');

    const feBlend1 = document.createElementNS(svgNs, 'feBlend');
    feBlend1.setAttribute('in', 'red');
    feBlend1.setAttribute('in2', 'green');
    feBlend1.setAttribute('mode', 'screen');
    feBlend1.setAttribute('result', 'rg');

    const feBlend2 = document.createElementNS(svgNs, 'feBlend');
    feBlend2.setAttribute('in', 'rg');
    feBlend2.setAttribute('in2', 'blue');
    feBlend2.setAttribute('mode', 'screen');
    feBlend2.setAttribute('result', 'output');

    const feBlur = document.createElementNS(svgNs, 'feGaussianBlur');
    feBlur.setAttribute('in', 'output');
    feBlur.setAttribute('stdDeviation', displace > 0 ? displace.toString() : '0.7');

    filterEl.appendChild(feImage);
    filterEl.appendChild(feDispRed);
    filterEl.appendChild(feColorRed);
    filterEl.appendChild(feDispGreen);
    filterEl.appendChild(feColorGreen);
    filterEl.appendChild(feDispBlue);
    filterEl.appendChild(feColorBlue);
    filterEl.appendChild(feBlend1);
    filterEl.appendChild(feBlend2);
    filterEl.appendChild(feBlur);
    defsEl.appendChild(filterEl);
    svgEl.appendChild(defsEl);
    el.appendChild(svgEl);

    // Decorative layers (Sheen & Rim)
    const sheen = document.createElement('span');
    sheen.className = 'glass-surface__sheen';
    sheen.setAttribute('aria-hidden', 'true');
    el.appendChild(sheen);

    const rim = document.createElement('span');
    rim.className = 'glass-surface__rim';
    rim.setAttribute('aria-hidden', 'true');
    el.appendChild(rim);

    // Content container wrapper for standalone components
    let contentEl = el.querySelector('.glass-surface__content');
    if (!contentEl && !asCard) {
      contentEl = document.createElement('div');
      contentEl.className = 'glass-surface__content';

      // Move existing children if container was pre-populated
      while (el.firstChild && el.firstChild !== svgEl && el.firstChild !== sheen && el.firstChild !== rim) {
        contentEl.appendChild(el.firstChild);
      }
      el.appendChild(contentEl);
    }

    // Displacement map generation
    const generateMap = () => {
      const rect = el.getBoundingClientRect();
      const actualWidth = Math.max(10, Math.round(rect.width || 400));
      const actualHeight = Math.max(10, Math.round(rect.height || 200));
      const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

      const svgContent = `
        <svg width="${actualWidth}" height="${actualHeight}" viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#0000"/>
              <stop offset="100%" stop-color="red"/>
            </linearGradient>
            <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0000"/>
              <stop offset="100%" stop-color="blue"/>
            </linearGradient>
            <filter id="${softId}" filterUnits="userSpaceOnUse" x="0" y="0" width="${actualWidth}" height="${actualHeight}" color-interpolation-filters="sRGB">
              <feGaussianBlur stdDeviation="${blur}" />
            </filter>
          </defs>
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
          <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" filter="url(#${softId})" />
        </svg>
      `;

      return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
    };

    const updateMap = () => {
      const mapUrl = generateMap();
      feImage.setAttribute('href', mapUrl);
    };

    // Initial update
    updateMap();

    // Resize observer
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateMap();
      });
      ro.observe(el);
    }

    // WebGL pipeline if enabled
    let webglCleanup = null;
    if (useWebGL) {
      const canvas = document.createElement('canvas');
      canvas.className = 'glass-surface__canvas';
      canvas.setAttribute('aria-hidden', 'true');
      el.appendChild(canvas);

      const frame = document.createElement('span');
      frame.className = 'glass-surface__frame';
      frame.setAttribute('aria-hidden', 'true');
      el.appendChild(frame);

      const gl = canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false
      });

      if (gl) {
        const program = compileGlass(gl);
        if (program) {
          const uniforms = {};
          [
            'uBackdrop',
            'uMap',
            'uCanvas',
            'uSize',
            'uOrigin',
            'uStep',
            'uScale',
            'uChannel',
            'uSpread',
            'uLod',
            'uSaturation'
          ].forEach(name => {
            uniforms[name] = gl.getUniformLocation(program, name);
          });

          const vao = gl.createVertexArray();
          const buffer = gl.createBuffer();
          gl.bindVertexArray(vao);
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
          gl.enableVertexAttribArray(0);
          gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

          const makeTex = () => {
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            return tex;
          };

          const backdropTex = makeTex();
          const mapTex = makeTex();
          const mapCanvas = document.createElement('canvas');
          const mapCtx = mapCanvas.getContext('2d');
          const picture = { node: null, key: '', width: 0, height: 0, mipmapped: false, ready: false };
          const mapState = { url: '', ready: false };
          let animFrame = 0;
          let isVisible = true;

          const loadWebglMap = url => {
            mapState.url = url;
            const img = new Image();
            img.onload = () => {
              if (mapState.url !== url || !mapCtx) return;
              const ratio = Math.min(2, window.devicePixelRatio || 1);
              mapCanvas.width = Math.max(1, Math.round(el.offsetWidth * ratio));
              mapCanvas.height = Math.max(1, Math.round(el.offsetHeight * ratio));
              mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
              mapCtx.drawImage(img, 0, 0, mapCanvas.width, mapCanvas.height);
              gl.bindTexture(gl.TEXTURE_2D, mapTex);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mapCanvas);
              mapState.ready = true;
            };
            img.src = url;
          };

          const uploadNode = node => {
            const isImg = node instanceof HTMLImageElement;
            gl.bindTexture(gl.TEXTURE_2D, backdropTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, node);
            if (isImg) gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, isImg ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
            [picture.width, picture.height] = sourceSize(node);
            picture.mipmapped = isImg;
            picture.ready = true;
          };

          const tick = () => {
            animFrame = 0;
            if (!isVisible || document.hidden) return;
            animFrame = requestAnimationFrame(tick);

            const mapUrl = generateMap();
            if (mapUrl !== mapState.url) loadWebglMap(mapUrl);

            const bNode = resolveBackdrop(backdrop);
            if (!bNode) return;

            let key = '';
            if (bNode instanceof HTMLImageElement) key = bNode.complete && bNode.naturalWidth ? bNode.currentSrc || bNode.src : '';
            else if (bNode instanceof HTMLVideoElement) key = bNode.readyState >= 2 ? `${bNode.currentSrc}|${bNode.currentTime}` : '';
            else key = `${bNode.width}x${bNode.height}|${performance.now()}`;

            if (key && (bNode !== picture.node || key !== picture.key)) {
              try {
                uploadNode(bNode);
              } catch {
                return;
              }
              picture.node = bNode;
              picture.key = key;
            }

            if (!picture.ready || !mapState.ready) return;

            const layoutWidth = el.offsetWidth;
            const layoutHeight = el.offsetHeight;
            if (!layoutWidth || !layoutHeight) return;

            const box = el.getBoundingClientRect();
            const content = contentBox(bNode);
            if (!content.width || !content.height) return;

            const ratio = Math.min(2, window.devicePixelRatio || 1);
            const w = Math.max(1, Math.round(layoutWidth * ratio));
            const h = Math.max(1, Math.round(layoutHeight * ratio));

            if (canvas.width !== w || canvas.height !== h) {
              canvas.width = w;
              canvas.height = h;
            }

            const scaleX = box.width / layoutWidth;
            const scaleY = box.height / layoutHeight;
            const texelsPerPixel = (picture.width / content.width) * (scaleX / ratio);
            const spreadTexels = (picture.width / content.width) * scaleX * Math.max(0, displace);
            const lod = picture.mipmapped
              ? Math.max(0, Math.log2(Math.max(texelsPerPixel, spreadTexels * 0.5, 0.000001)))
              : 0;

            gl.viewport(0, 0, w, h);
            gl.useProgram(program);
            gl.bindVertexArray(vao);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, backdropTex);
            gl.uniform1i(uniforms.uBackdrop, 0);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, mapTex);
            gl.uniform1i(uniforms.uMap, 1);
            gl.uniform2f(uniforms.uCanvas, w, h);
            gl.uniform2f(uniforms.uSize, layoutWidth, layoutHeight);
            gl.uniform2f(uniforms.uOrigin, (box.left - content.x) / content.width, (box.top - content.y) / content.height);
            gl.uniform2f(uniforms.uStep, scaleX / content.width, scaleY / content.height);
            gl.uniform3f(
              uniforms.uScale,
              distortionScale + redOffset,
              distortionScale + greenOffset,
              distortionScale + blueOffset
            );
            gl.uniform2i(uniforms.uChannel, CHANNELS[xChannel] ?? 0, CHANNELS[yChannel] ?? 1);
            gl.uniform1f(uniforms.uSpread, Math.max(0, displace));
            gl.uniform1f(uniforms.uLod, lod);
            gl.uniform1f(uniforms.uSaturation, saturation);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
          };

          const io = new IntersectionObserver(entries => {
            isVisible = entries.some(e => e.isIntersecting);
            if (isVisible && !animFrame) animFrame = requestAnimationFrame(tick);
          });
          io.observe(el);

          animFrame = requestAnimationFrame(tick);

          webglCleanup = () => {
            cancelAnimationFrame(animFrame);
            io.disconnect();
            gl.deleteTexture(backdropTex);
            gl.deleteTexture(mapTex);
            gl.deleteBuffer(buffer);
            gl.deleteVertexArray(vao);
            gl.deleteProgram(program);
          };
        }
      }
    }

    return {
      element: el,
      content: contentEl,
      update: updateMap,
      destroy: () => {
        if (ro) ro.disconnect();
        if (webglCleanup) webglCleanup();
      }
    };
  }

  /**
   * Upgrades an existing HTML element in-place to have full GlassSurface optical effects
   */
  function applyGlassSurface(element, options = {}) {
    if (!element || !(element instanceof HTMLElement)) return null;
    if (element.dataset.glassApplied === 'true') return null;

    element.dataset.glassApplied = 'true';

    // Infer border radius from computed style if not supplied
    const computed = window.getComputedStyle(element);
    const parsedRadius = parseFloat(computed.borderRadius) || 20;

    const mergedOptions = {
      borderRadius: parsedRadius,
      asCard: true,
      backgroundOpacity: 0.035,
      distortionScale: -150,
      blur: 10,
      saturation: 1.15,
      ...options
    };

    return createGlassSurface(element, mergedOptions);
  }

  /**
   * Initializes GlassSurface across all major UI cards & panels on the portfolio website
   */
  function initAllGlassSurfaces() {
    const selectors = [
      '.availability-pill',
      '.about-profile-card',
      '.value-card',
      '.skill-category-card',
      '.skills-category-card',
      '.education-box',
      '.project-card',
      '.timeline-card',
      '.form-panel',
      '.contact-card',
      '.project-cta-banner',
      '.modal-window',
      '.footer-sling-dock'
    ];

    const instances = [];

    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const instance = applyGlassSurface(el);
        if (instance) instances.push(instance);
      });
    });

    // Expose dynamic observer for cards created on the fly (e.g. project filter clicks or modals)
    const observer = new MutationObserver(() => {
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          if (!el.dataset.glassApplied) {
            const instance = applyGlassSurface(el);
            if (instance) instances.push(instance);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return instances;
  }

  // Export to window
  window.GlassSurface = {
    create: createGlassSurface,
    apply: applyGlassSurface,
    initAll: initAllGlassSurfaces
  };

})(window, document);
