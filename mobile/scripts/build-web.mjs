// Builds the hostable web version of the mobile app:
//   dist/index.html  the phone-frame page (simulator/index.html)
//   dist/app/        the Expo web build, served from the "/app" sub-path
// EXPO_PUBLIC_* values (for example EXPO_PUBLIC_AI_URL) are read from the environment or mobile/.env.local at build time.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const r = spawnSync('npx', ['expo', 'export', '--platform', 'web', '--output-dir', join('dist', 'app')], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, EXPO_BASE_URL: '/app' },
});
if (r.status !== 0) {
  console.error('expo export failed');
  process.exit(r.status ?? 1);
}
copyFileSync(join(root, 'simulator', 'index.html'), join(dist, 'index.html'));
console.log('web build ready in mobile/dist  ( / = phone frame, /app/ = the app )');
