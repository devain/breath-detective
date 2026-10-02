// Publish the starter issues in .github/issue-drafts/ to GitHub using the gh CLI.
//
//   node scripts/publish-issues.mjs          # dry run: shows what would be created
//   node scripts/publish-issues.mjs --yes    # create labels + issues for real
//
// Requires https://cli.github.com and `gh auth login`. Safe to re-run: labels are
// upserted and issues whose title already exists (open or closed) are skipped.
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const REPO = 'devain/breath-detective';
const DRAFTS = new URL('../.github/issue-drafts/', import.meta.url);
const live = process.argv.includes('--yes');

const LABELS = {
  'good first issue': ['7057ff', 'Small, well-scoped, no deep project knowledge needed'],
  'help wanted': ['008672', 'Bigger or open-ended; contributions very welcome'],
  research: ['d4c5f9', 'Literature, protocol, measurement science'],
  hardware: ['fbca04', 'Sensors, BLE, physical prototypes'],
  AI: ['1d76db', 'Recommendation, pattern discovery, ML'],
  UX: ['e99695', 'Interface, layout, accessibility, visualization'],
  gameplay: ['f5a524', 'Cases, experiments, balance, game feedback'],
  documentation: ['0075ca', 'Docs and explanations'],
  bug: ['d73a4a', 'Something is broken'],
  idea: ['a2eeef', 'Feature ideas and challenges to assumptions'],
};

function gh(args, { allowFail = false } = {}) {
  const r = spawnSync('gh', args, { encoding: 'utf8' });
  if (r.error) throw new Error('gh CLI not found. Install it from https://cli.github.com and run `gh auth login`.');
  if (r.status !== 0 && !allowFail) throw new Error(`gh ${args.join(' ')}\n${r.stderr}`);
  return r;
}

function parseDraft(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error('missing front matter');
  const title = m[1].match(/^title:\s*"(.*)"\s*$/m)?.[1];
  const labels = (m[1].match(/^labels:\s*\[(.*)\]\s*$/m)?.[1] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return { title, labels, body: m[2].trim() + '\n' };
}

const drafts = readdirSync(DRAFTS)
  .filter((f) => f.endsWith('.md'))
  .sort()
  .map((f) => ({ file: f, ...parseDraft(readFileSync(new URL(f, DRAFTS), 'utf8')) }));

for (const d of drafts) {
  const unknown = d.labels.filter((l) => !LABELS[l]);
  if (!d.title || unknown.length) throw new Error(`${d.file}: bad title or unknown labels ${unknown}`);
}

if (!live) {
  console.log(`Dry run: ${drafts.length} issues for ${REPO}\n`);
  for (const d of drafts) console.log(`  • ${d.title}  [${d.labels.join(', ')}]`);
  console.log('\nRun with --yes to create them (requires `gh auth login`).');
  process.exit(0);
}

gh(['auth', 'status']);

for (const [name, [color, description]] of Object.entries(LABELS)) {
  gh(['label', 'create', name, '--repo', REPO, '--color', color, '--description', description, '--force']);
  console.log(`label  ✓ ${name}`);
}

const existing = new Set(
  JSON.parse(gh(['issue', 'list', '--repo', REPO, '--state', 'all', '--limit', '1000', '--json', 'title']).stdout).map((i) => i.title),
);
const tmp = mkdtempSync(join(tmpdir(), 'bd-issues-'));

for (const d of drafts) {
  if (existing.has(d.title)) {
    console.log(`issue  – skipped (exists): ${d.title}`);
    continue;
  }
  const bodyFile = join(tmp, d.file);
  writeFileSync(bodyFile, d.body);
  const args = ['issue', 'create', '--repo', REPO, '--title', d.title, '--body-file', bodyFile];
  d.labels.forEach((l) => args.push('--label', l));
  const url = gh(args).stdout.trim();
  console.log(`issue  ✓ ${url}  ${d.title}`);
}
