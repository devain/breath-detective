// Fictional case files. `hiddenFactors` are the secret contributions the
// simulation uses; the UI never reads them during an investigation.
// Each playthrough jitters them by `jitter` (seeded), so numbers can't be memorised.
export const CASES = [
  {
    id: 'case-001',
    number: '001',
    title: 'The Tongue Mystery',
    teaser: 'Something smells suspicious…',
    description:
      'A mysterious breath profile has been detected. Strong, persistent, and present all day. Find out what changes the signal.',
    notes: ['Signal is steady across the day.', 'H₂S is the largest gas by volume (ppb).'],
    hiddenFactors: { tongue: 0.7, oral: 0.2, dry: 0.1, food: 0.02 },
    intensity: 1,
    morningAmp: 0.15,
    noise: 0.035,
    jitter: 0.1,
  },
  {
    id: 'case-002',
    number: '002',
    title: 'The Morning Mystery',
    teaser: 'Worst at sunrise. Gone by lunch?',
    description:
      'The subject reports the signal is strongest after waking. Samples are taken first thing in the morning.',
    notes: ['Samples are taken at 07:00.', 'Subject sleeps with the window open.'],
    hiddenFactors: { dry: 0.62, tongue: 0.22, oral: 0.09, nasal: 0.04, food: 0.03 },
    intensity: 1,
    morningAmp: 0.72,
    noise: 0.04,
    jitter: 0.1,
  },
  {
    id: 'case-003',
    number: '003',
    title: 'The Food Suspect',
    teaser: 'It came after dinner.',
    description:
      'A sharp signal appeared after a heavy meal. Cleaning the mouth seems to help less than expected.',
    notes: ['Sample taken 2 h after dinner.', 'DMS is unusually prominent.'],
    hiddenFactors: { food: 0.6, tongue: 0.2, oral: 0.1, dry: 0.1 },
    intensity: 1,
    morningAmp: 0.15,
    noise: 0.04,
    jitter: 0.1,
  },
  {
    id: 'case-004',
    number: '004',
    title: 'The Mixed Signal',
    teaser: 'More than one culprit.',
    description:
      'A noisy profile with no single obvious source. Expect overlapping responses and conflicting runs. Two suspects are likely involved.',
    notes: ['Sensor noise is higher in this case.', 'Report a primary and a secondary suspect.'],
    // Two dominant suspects are drawn per playthrough (see caseEngine).
    mixedPool: ['tongue', 'oral', 'dry', 'nasal'],
    requireSecondary: true,
    intensity: 1.05,
    morningAmp: 0.25,
    noise: 0.05,
    jitter: 0.08,
  },
  {
    id: 'case-005',
    number: '005',
    title: 'The Nasal Route',
    teaser: 'The mouth looks clean. The signal disagrees.',
    description:
      'Thorough oral cleaning barely moves the needle. The source may not be where everyone is looking.',
    notes: ['Subject reports a recent cold.', 'DMS reads higher than a mouth-only profile predicts.'],
    hiddenFactors: { nasal: 0.6, tongue: 0.18, oral: 0.1, dry: 0.08, food: 0.04 },
    intensity: 1,
    morningAmp: 0.2,
    noise: 0.04,
    jitter: 0.1,
  },
];

export const CASE_BY_ID = Object.fromEntries(CASES.map((c) => [c.id, c]));
