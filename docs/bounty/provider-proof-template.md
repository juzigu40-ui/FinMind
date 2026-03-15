# Provider proof template

Use this table when filling a hosted deployment proof pack.

| Platform | Deploy command | Validate command | Frontend URL | Health URL | Screenshot | Smoke log | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Render | `./deploy/render/validate.sh --frontend-url <url> --api-url <url>` | `./deploy/render/validate.sh --frontend-url <url> --api-url <url>` | — | — | — | — | — |
| DigitalOcean App Platform | `./deploy/digitalocean/app-platform/deploy.sh --spec deploy/digitalocean/app-platform/app.yaml` | `./deploy/digitalocean/app-platform/validate.sh --frontend-url <url> --api-url <url>` | — | — | — | — | — |
| DigitalOcean Droplet | `AUTO_START=1 ./deploy/digitalocean/droplet/setup.sh` | `AUTO_START=1 AUTO_VALIDATE=1 ./deploy/digitalocean/droplet/setup.sh` | — | — | — | — | — |
| AWS ECS Fargate | `./deploy/aws/deploy.sh` | `./deploy/aws/validate.sh --frontend-url <url> --api-url <url>` | — | — | — | — | — |
| GCP Cloud Run | `./deploy/gcp/deploy.sh` | `./deploy/gcp/validate.sh --frontend-url <url> --api-url <url>` | — | — | — | — | — |
| Azure Container Apps | `./deploy/azure/deploy.sh` | `./deploy/azure/validate.sh --frontend-url <url> --api-url <url>` | — | — | — | — | — |
