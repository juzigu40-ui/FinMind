# Bounty Submission: Universal One-Click Deployment (Docker + K8s + Tilt) for FinMind

Discord coordination for `#144` is in place. If the maintainer wants the Discord record mirrored on GitHub, the screenshot note is prepared in `docs/bounty/discord-proof-comment.md`.

Current submission head: `39f6d2d`

## Current checks

- CI: [23118014983](https://github.com/juzigu40-ui/FinMind/actions/runs/23118014983)
- Deploy Artifacts: [23118014995](https://github.com/juzigu40-ui/FinMind/actions/runs/23118014995)
- CodeQL: [23118014997](https://github.com/juzigu40-ui/FinMind/actions/runs/23118014997)

## Acceptance entry page

| Platform | Deploy command | Validate command | Proof status | Live URL |
| --- | --- | --- | --- | --- |
| Production Compose | `./scripts/review-deploy.sh` | `./scripts/review-deploy.sh` | `CI-validated` | Local only |
| Kubernetes / Helm | `./scripts/review-k8s.sh` | `helm test finmind -n finmind --logs` | `CI-validated` | Local only |
| Tilt | `tilt up` | `tilt ci --timeout 10m` | `CI-validated` | Local only |
| Render | Blueprint: `render.yaml` | `./deploy/render/validate.sh --frontend-url https://finmind-frontend-sexs.onrender.com --api-url https://finmind-backend-ht43.onrender.com` | `Provider-validated` | `https://finmind-frontend-sexs.onrender.com` |
| DigitalOcean App Platform | `./deploy/digitalocean/app-platform/deploy.sh --spec deploy/digitalocean/app-platform/app.yaml` | `./deploy/digitalocean/app-platform/validate.sh --frontend-url <url> --api-url <url>` | `Repo-ready` | — |
| DigitalOcean Droplet | `AUTO_START=1 ./deploy/digitalocean/droplet/setup.sh` | `AUTO_START=1 AUTO_VALIDATE=1 ./deploy/digitalocean/droplet/setup.sh` | `Repo-ready` | — |
| AWS ECS Fargate | `./deploy/aws/deploy.sh` | `./deploy/aws/validate.sh --frontend-url <url> --api-url <url>` | `Repo-ready` | — |
| GCP Cloud Run | `./deploy/gcp/deploy.sh` | `./deploy/gcp/validate.sh --frontend-url <url> --api-url <url>` | `Repo-ready` | — |
| Azure Container Apps | `./deploy/azure/deploy.sh` | `./deploy/azure/validate.sh --frontend-url <url> --api-url <url>` | `Repo-ready` | — |

## Hosted proof carried by this submission

- Provider: `Render`
- Proof commit: `a622e03`
- Frontend URL: `https://finmind-frontend-sexs.onrender.com`
- API URL: `https://finmind-backend-ht43.onrender.com`
- Health URL: `https://finmind-backend-ht43.onrender.com/health/ready`
- Smoke log: [docs/bounty/provider-proofs/render/smoke.log](https://github.com/juzigu40-ui/FinMind/blob/codex/finmind-144-deploy-bounty/docs/bounty/provider-proofs/render/smoke.log)
- UI validation log: [docs/bounty/provider-proofs/render/ui.log](https://github.com/juzigu40-ui/FinMind/blob/codex/finmind-144-deploy-bounty/docs/bounty/provider-proofs/render/ui.log)
- Screenshot: [docs/bounty/provider-proofs/render/render-2026-03-15-a622e03.png](https://github.com/juzigu40-ui/FinMind/blob/codex/finmind-144-deploy-bounty/docs/bounty/provider-proofs/render/render-2026-03-15-a622e03.png)
- Metadata: [docs/bounty/provider-proofs/render/metadata.txt](https://github.com/juzigu40-ui/FinMind/blob/codex/finmind-144-deploy-bounty/docs/bounty/provider-proofs/render/metadata.txt)

## Review files

- Acceptance matrix: [docs/bounty/acceptance-matrix.md](https://github.com/juzigu40-ui/FinMind/blob/codex/finmind-144-deploy-bounty/docs/bounty/acceptance-matrix.md)
- Live previews worksheet: [docs/bounty/live-previews.md](https://github.com/juzigu40-ui/FinMind/blob/codex/finmind-144-deploy-bounty/docs/bounty/live-previews.md)
- Provider proof worksheet: [docs/bounty/provider-proof-template.md](https://github.com/juzigu40-ui/FinMind/blob/codex/finmind-144-deploy-bounty/docs/bounty/provider-proof-template.md)
- Maintainer walkthrough: [docs/demo/maintainer-review-walkthrough.md](https://github.com/juzigu40-ui/FinMind/blob/codex/finmind-144-deploy-bounty/docs/demo/maintainer-review-walkthrough.md)
- Demo video: [docs/demo/finmind-deploy-demo.mp4](https://github.com/juzigu40-ui/FinMind/blob/codex/finmind-144-deploy-bounty/docs/demo/finmind-deploy-demo.mp4)

## What changed in the submission path

- Hosted validation now converges on `./scripts/validate-public-deployment.sh`, so the same smoke and UI path can be reused across public deployments.
- Render closes `init-db` through `dockerCommand` plus `FINMIND_RUN_INIT_DB_ON_BOOT=1`, which keeps the path free-tier compatible.
- DigitalOcean App Platform closes `init-db` with a `PRE_DEPLOY` migration job and uses provider-native public URL wiring for backend CORS and frontend API resolution.
- DigitalOcean Droplet now deploys the requested repo, ref, and optional commit SHA, leaves first checkout stopped by default, and only validates when explicitly requested.
- AWS ECS Fargate, GCP Cloud Run, and Azure Container Apps now each have concrete deploy, validate, and destroy scripts in-repo.
- The K8s runtime path now runs Helm plus Tilt in workflow instead of stopping at template output.

## Visual walkthrough

Current demo video: `docs/demo/finmind-deploy-demo.mp4`

<table>
  <tr>
    <td width="50%" align="center">
      <img src="https://raw.githubusercontent.com/juzigu40-ui/FinMind/codex/finmind-144-deploy-bounty/docs/demo/pr-readiness.jpg" alt="Readiness check" width="100%" />
      <br />
      <sub>Readiness first: database and Redis are both connected before the UI flow starts.</sub>
    </td>
    <td width="50%" align="center">
      <img src="https://raw.githubusercontent.com/juzigu40-ui/FinMind/codex/finmind-144-deploy-bounty/docs/demo/pr-signup.jpg" alt="Signup flow" width="100%" />
      <br />
      <sub>Fresh signup in the same run, so the walkthrough does not depend on preloaded data.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="https://raw.githubusercontent.com/juzigu40-ui/FinMind/codex/finmind-144-deploy-bounty/docs/demo/pr-bills.jpg" alt="Bills flow" width="100%" />
      <br />
      <sub>Bill creation happens live before reminders are scheduled.</sub>
    </td>
    <td width="50%" align="center">
      <img src="https://raw.githubusercontent.com/juzigu40-ui/FinMind/codex/finmind-144-deploy-bounty/docs/demo/pr-expenses.jpg" alt="Expenses flow" width="100%" />
      <br />
      <sub>Expense entry is committed and appears in the list during the same recording.</sub>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://raw.githubusercontent.com/juzigu40-ui/FinMind/codex/finmind-144-deploy-bounty/docs/demo/pr-analytics.jpg" alt="Analytics flow" width="100%" />
      <br />
      <sub>The walkthrough ends in analytics after the earlier data path has already been exercised.</sub>
    </td>
  </tr>
</table>
