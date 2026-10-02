// Small deterministic PRNG helpers so every playthrough is reproducible from its seed.

export function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngFor(...parts) {
  return mulberry32(hashString(parts.join(':')));
}

// Standard normal sample (Box–Muller), clamped to ±2.5σ to avoid wild outliers.
export function gaussian(rng) {
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return Math.max(-2.5, Math.min(2.5, z));
}

export function newSeed() {
  return Math.floor(Math.random() * 0xffffffff).toString(36);
}
