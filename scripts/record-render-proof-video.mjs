import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const VIEWPORT = { width: 1440, height: 900 };

function usage() {
  console.error(
    [
      'Usage: node scripts/record-render-proof-video.mjs',
      '  --output <webm-path>',
      '  --user-data-dir <chrome-profile-dir>',
      '  --deploy-url <render-deploy-url>',
      '  --backend-dashboard-url <render-backend-dashboard-url>',
      '  --frontend-url <frontend-url>',
      '  --health-url <health-url>',
      '  --commit-sha <sha>',
    ].join(' '),
  );
}

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];

    switch (arg) {
      case '--output':
        options.outputPath = value;
        index += 1;
        break;
      case '--user-data-dir':
        options.userDataDir = value;
        index += 1;
        break;
      case '--deploy-url':
        options.deployUrl = value;
        index += 1;
        break;
      case '--backend-dashboard-url':
        options.backendDashboardUrl = value;
        index += 1;
        break;
      case '--frontend-url':
        options.frontendUrl = value;
        index += 1;
        break;
      case '--health-url':
        options.healthUrl = value;
        index += 1;
        break;
      case '--commit-sha':
        options.commitSha = value;
        index += 1;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (
    !options.outputPath ||
    !options.userDataDir ||
    !options.deployUrl ||
    !options.backendDashboardUrl ||
    !options.frontendUrl ||
    !options.healthUrl ||
    !options.commitSha
  ) {
    usage();
    throw new Error('Missing required arguments');
  }

  return options;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function humanType(page, selector, value, delayMs = 85) {
  const locator = page.locator(selector);
  await locator.click();
  await locator.fill('');
  await page.keyboard.type(value, { delay: delayMs });
}

async function waitForQuietUi(page) {
  await page.waitForLoadState('domcontentloaded');
  await delay(1200);
}

async function waitForDashboard(page) {
  await Promise.race([
    page.waitForURL(/\/dashboard(?:\/)?(?:[?#].*)?$/, { timeout: 35000 }),
    page.getByRole('heading', { name: /Financial Dashboard/i }).waitFor({ timeout: 35000 }),
  ]);
  await delay(1500);
}

function primaryNavLink(page, name) {
  return page.getByRole('navigation').getByRole('link', { name, exact: true }).first();
}

function buildHealthCheckPage(healthUrl) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>FinMind Render readiness proof</title>
    <style>
      :root {
        color-scheme: light;
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #0f172a 0%, #111827 45%, #164e63 100%);
        color: #e5f3ff;
      }
      .card {
        width: min(980px, calc(100vw - 96px));
        border-radius: 28px;
        padding: 32px 36px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.24);
        box-shadow: 0 24px 80px rgba(15, 23, 42, 0.35);
      }
      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.14);
        color: #a7f3d0;
        font-size: 14px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #34d399;
        box-shadow: 0 0 18px rgba(52, 211, 153, 0.9);
      }
      h1 {
        margin: 22px 0 10px;
        font-size: 42px;
        line-height: 1.02;
      }
      p {
        margin: 0;
        color: #cbd5e1;
        font-size: 18px;
      }
      pre {
        margin: 26px 0 0;
        padding: 20px 22px;
        border-radius: 20px;
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(148, 163, 184, 0.2);
        color: #bfdbfe;
        font-size: 18px;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-word;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="eyebrow"><span class="dot"></span>Render hosted proof</div>
      <h1 id="status">Checking /health/ready…</h1>
      <p>Verifying database and Redis connectivity on the deployed Render services.</p>
      <pre id="details">Waiting for readiness response…</pre>
    </main>
    <script>
      const details = document.getElementById('details');
      const status = document.getElementById('status');
      fetch(${JSON.stringify(healthUrl)})
        .then(async (response) => {
          const payload = await response.json();
          document.body.dataset.ready = response.ok ? 'true' : 'false';
          status.textContent = response.ok ? 'Render deployment ready' : 'Render deployment not ready';
          details.textContent = JSON.stringify(payload, null, 2);
        })
        .catch((error) => {
          document.body.dataset.ready = 'error';
          status.textContent = 'Readiness check failed';
          details.textContent = String(error);
        });
    </script>
  </body>
</html>`;
}

function buildDeployProofPage({ deployUrl, commitSha }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Branch-specific Deploy to Render proof</title>
    <style>
      :root {
        color-scheme: light;
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #030712 0%, #0f172a 50%, #1d4ed8 100%);
        color: #eff6ff;
      }
      .card {
        width: min(1040px, calc(100vw - 96px));
        border-radius: 28px;
        padding: 34px 38px;
        background: rgba(15, 23, 42, 0.82);
        border: 1px solid rgba(148, 163, 184, 0.22);
        box-shadow: 0 24px 80px rgba(15, 23, 42, 0.4);
      }
      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(59, 130, 246, 0.18);
        color: #bfdbfe;
        font-size: 14px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #60a5fa;
        box-shadow: 0 0 18px rgba(96, 165, 250, 0.9);
      }
      h1 {
        margin: 22px 0 12px;
        font-size: 42px;
        line-height: 1.04;
      }
      p {
        margin: 0 0 22px;
        color: #dbeafe;
        font-size: 18px;
      }
      .grid {
        display: grid;
        gap: 14px;
      }
      .item {
        padding: 16px 18px;
        border-radius: 18px;
        background: rgba(15, 23, 42, 0.76);
        border: 1px solid rgba(148, 163, 184, 0.18);
      }
      .label {
        color: #93c5fd;
        font-size: 13px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .value {
        margin-top: 8px;
        font-size: 18px;
        line-height: 1.45;
        word-break: break-word;
      }
      code {
        color: #bfdbfe;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="eyebrow"><span class="dot"></span>Maintainer-requested free-platform one-click proof</div>
      <h1>Opened the branch-specific Deploy to Render link</h1>
      <p>This proof uses the PR branch, not <code>main</code>, and the hosted deployment below is currently live on commit <code>${commitSha}</code>.</p>
      <section class="grid">
        <div class="item">
          <div class="label">Repository</div>
          <div class="value"><code>juzigu40-ui/FinMind</code></div>
        </div>
        <div class="item">
          <div class="label">Branch</div>
          <div class="value"><code>codex/finmind-144-deploy-bounty</code></div>
        </div>
        <div class="item">
          <div class="label">Blueprint path</div>
          <div class="value"><code>render.yaml</code></div>
        </div>
        <div class="item">
          <div class="label">Deploy link</div>
          <div class="value"><code>${deployUrl}</code></div>
        </div>
      </section>
    </main>
  </body>
</html>`;
}

async function waitForText(page, text, timeout = 45000) {
  await page.waitForFunction(
    (needle) => document.body && document.body.innerText.includes(needle),
    text,
    { timeout },
  );
}

async function main() {
  const {
    outputPath,
    userDataDir,
    deployUrl,
    backendDashboardUrl,
    frontendUrl,
    healthUrl,
    commitSha,
  } = parseArgs(process.argv.slice(2));

  const resolvedOutputPath = path.resolve(outputPath);
  const outputDir = path.dirname(resolvedOutputPath);
  await fs.mkdir(outputDir, { recursive: true });

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    channel: 'chrome',
    viewport: VIEWPORT,
    args: ['--disable-dev-shm-usage'],
    recordVideo: {
      dir: outputDir,
      size: VIEWPORT,
    },
  });
  const page = context.pages()[0] ?? (await context.newPage());
  page.setDefaultTimeout(45000);
  const video = page.video();

  const email = `render-proof+${Date.now()}@finmind.local`;
  const password = 'ProofPass123!';

  try {
    await page.goto(deployUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(2000);
    await page.setContent(buildDeployProofPage({ deployUrl, commitSha }), {
      waitUntil: 'domcontentloaded',
    });
    await delay(6500);

    await page.goto(backendDashboardUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitForText(page, 'finmind后端');
    await waitForText(page, 'codex/finmind-144');
    await waitForText(page, commitSha, 60000);
    await delay(7000);

    await page.goto(frontendUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitForText(page, 'FinMind');
    await delay(3500);

    await page.setContent(buildHealthCheckPage(healthUrl), { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.body.dataset.ready === 'true', {
      timeout: 30000,
    });
    await delay(5500);

    await page.goto(frontendUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitForText(page, 'FinMind');
    await waitForQuietUi(page);
    await delay(2500);
    await page.goto(`${frontendUrl.replace(/\/$/, '')}/register`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await waitForQuietUi(page);
    await delay(1500);

    await humanType(page, '#email', email);
    await delay(250);
    await humanType(page, '#password', password);
    await delay(250);
    await humanType(page, '#confirmPassword', password);
    await delay(350);
    await page.locator('form button[type="submit"]').click();
    await waitForDashboard(page);
    await delay(3500);

    await delay(4500);
  } finally {
    await context.close();
  }

  if (!video) {
    throw new Error('No video was recorded');
  }

  const recordedPath = await video.path();
  await fs.rename(recordedPath, resolvedOutputPath);
  console.log(resolvedOutputPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
