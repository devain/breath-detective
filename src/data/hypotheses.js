// The five suspects a player can form hypotheses about.
// `profile` is the simulated gas fingerprint (ppb) a suspect emits at full
// contribution. Values are game-tuned, not clinical reference data.
export const HYPOTHESES = [
  {
    id: 'tongue',
    icon: '👅',
    name: 'Tongue',
    statement: 'the tongue coating is contributing to the signal',
    profile: { h2s: 230, ch3sh: 70, dms: 6 },
  },
  {
    id: 'oral',
    icon: '🦷',
    name: 'Oral',
    statement: 'teeth and gumline are contributing to the signal',
    profile: { h2s: 120, ch3sh: 140, dms: 6 },
  },
  {
    id: 'dry',
    icon: '💧',
    name: 'Dry mouth',
    statement: 'low saliva flow is amplifying the signal',
    profile: { h2s: 170, ch3sh: 80, dms: 10 },
  },
  {
    id: 'nasal',
    icon: '👃',
    name: 'Nasal',
    statement: 'part of the signal comes from the nasal route',
    profile: { h2s: 60, ch3sh: 30, dms: 40 },
  },
  {
    id: 'food',
    icon: '🍜',
    name: 'Food',
    statement: 'a recent meal is producing a transient signal',
    profile: { h2s: 30, ch3sh: 20, dms: 60 },
  },
];

export const HYPOTHESIS_BY_ID = Object.fromEntries(HYPOTHESES.map((h) => [h.id, h]));

// Background level present in every simulated sample.
export const AMBIENT = { h2s: 15, ch3sh: 4, dms: 3 };

// Per-gas reference levels used to build the composite VSC index.
export const GAS_REFERENCE = { h2s: 112, ch3sh: 26, dms: 8 };

export const GASES = [
  { id: 'h2s', label: 'H₂S', name: 'Hydrogen sulfide' },
  { id: 'ch3sh', label: 'CH₃SH', name: 'Methyl mercaptan' },
  { id: 'dms', label: 'DMS', name: 'Dimethyl sulfide' },
];
