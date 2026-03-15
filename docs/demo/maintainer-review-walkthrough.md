# Maintainer review walkthrough

This file is the shortest route through the acceptance material for `#308`.

## 1. Local review

Run:

```bash
./scripts/review-deploy.sh
```

That verifies:

- frontend reachability
- backend `/health`
- backend `/health/ready`
- database and Redis connectivity
- auth plus the core product modules
- Prometheus and Grafana health

## 2. K8s runtime

Run:

```bash
./scripts/review-k8s.sh
```

That path installs the Helm chart into kind, runs `helm test`, then rechecks the branch-local frontend and backend through the same smoke path.

Tilt uses the same repo path:

```bash
tilt up
```

## 3. Provider proofs

Provider entry points live here:

- Render: `render.yaml`
- DigitalOcean App Platform: `.do/app.yaml`
- DigitalOcean Droplet: `deploy/digitalocean/droplet/setup.sh`
- AWS ECS Fargate: `deploy/aws/deploy.sh`
- GCP Cloud Run: `deploy/gcp/deploy.sh`
- Azure Container Apps: `deploy/azure/deploy.sh`

All hosted rechecks converge on:

```bash
./scripts/validate-public-deployment.sh \
  --frontend-url <url> \
  --api-base-url <url>
```

## 4. Live previews

Use these companion files while filling provider evidence:

- `docs/bounty/live-previews.md`
- `docs/bounty/provider-proof-template.md`

## 5. Demo assets

- Video: `docs/demo/finmind-deploy-demo.mp4`
- Screenshots: `docs/demo/`
