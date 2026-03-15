# Bounty Submission: Universal One-Click Deployment (Docker + K8s + Tilt) for FinMind

Discord coordination for `#144` is in place. Attach the Discord screenshot in the PR thread if the maintainer wants the coordination record mirrored on GitHub.

Current submission head: `__UPDATE_HEAD_SHA__`

## Acceptance entry page

| Platform | Deploy command | Validate command | Proof status | Live URL |
| --- | --- | --- | --- | --- |
| Production Compose | `./scripts/review-deploy.sh` | `./scripts/review-deploy.sh` | `CI-validated` | Local only |
| Kubernetes / Helm | `./scripts/review-k8s.sh` | `helm test finmind -n finmind --logs` | `CI-validated` | Local only |
| Tilt | `tilt up` | `tilt ci --timeout 10m` | `CI-validated` | Local only |
| Render | Blueprint: `render.yaml` | `./deploy/render/validate.sh --frontend-url <url> --api-url <url>` | `Repo-ready` | `__OPTIONAL_RENDER_URL__` |
| DigitalOcean App Platform | `./deploy/digitalocean/app-platform/deploy.sh --spec deploy/digitalocean/app-platform/app.yaml` | `./deploy/digitalocean/app-platform/validate.sh --frontend-url <url> --api-url <url>` | `Repo-ready` | `__OPTIONAL_DO_APP_URL__` |
| DigitalOcean Droplet | `AUTO_START=1 ./deploy/digitalocean/droplet/setup.sh` | `AUTO_START=1 AUTO_VALIDATE=1 ./deploy/digitalocean/droplet/setup.sh` | `Repo-ready` | `__OPTIONAL_DROPLET_URL__` |
| AWS ECS Fargate | `./deploy/aws/deploy.sh` | `./deploy/aws/validate.sh --frontend-url <url> --api-url <url>` | `Repo-ready` | `__OPTIONAL_AWS_URL__` |
| GCP Cloud Run | `./deploy/gcp/deploy.sh` | `./deploy/gcp/validate.sh --frontend-url <url> --api-url <url>` | `Repo-ready` | `__OPTIONAL_GCP_URL__` |
| Azure Container Apps | `./deploy/azure/deploy.sh` | `./deploy/azure/validate.sh --frontend-url <url> --api-url <url>` | `Repo-ready` | `__OPTIONAL_AZURE_URL__` |

## Current checks

- CI: `__UPDATE_CI_RUN_URL__`
- Deploy Artifacts: `__UPDATE_DEPLOY_ARTIFACTS_RUN_URL__`
- CodeQL: `__UPDATE_CODEQL_RUN_URL__`
- K8s Runtime: `__UPDATE_K8S_RUN_URL__`

## Current artifact links

- Acceptance matrix: `docs/bounty/acceptance-matrix.md`
- Live previews: `docs/bounty/live-previews.md`
- Provider proof template: `docs/bounty/provider-proof-template.md`
- Walkthrough: `docs/demo/maintainer-review-walkthrough.md`
- Demo video: `docs/demo/finmind-deploy-demo.mp4`

## What changed in the acceptance path

- Provider validate paths now converge on `./scripts/validate-public-deployment.sh`, so the same smoke + UI flow can be used across hosted deployments.
- Render now closes init-db through `dockerCommand` plus `FINMIND_RUN_INIT_DB_ON_BOOT=1`, which keeps the path free-tier compatible without relying on paid-only pre-deploy hooks.
- DigitalOcean App Platform now closes init-db with a `PRE_DEPLOY` migration job and uses provider-native public URL wiring for backend CORS and frontend API resolution.
- DigitalOcean Droplet now deploys the requested repo/ref/sha, does not auto-start on first checkout, and can auto-validate only when explicitly requested.
- AWS, GCP, and Azure now have real deploy/validate/destroy scripts instead of echo-only placeholders.
- The K8s runtime path now includes the real Helm runtime review script and the workflow installs Tilt before running the same path in CI.
