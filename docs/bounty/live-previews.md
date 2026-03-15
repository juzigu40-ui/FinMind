# Live previews

This file is the fill-in sheet for provider URLs. If provider credentials are not available on the current machine, keep the URL fields empty and use the deploy commands below when a provider session is ready.

| Platform | Deploy command | Frontend URL | API URL | Health URL | Notes |
| --- | --- | --- | --- | --- | --- |
| Render | Blueprint via `render.yaml` | `https://finmind-frontend-sexs.onrender.com` | `https://finmind-backend-ht43.onrender.com` | `https://finmind-backend-ht43.onrender.com/health/ready` | Provider-validated on `a622e03`; proof pack in `docs/bounty/provider-proofs/render/` |
| DigitalOcean App Platform | `./deploy/digitalocean/app-platform/deploy.sh --spec deploy/digitalocean/app-platform/app.yaml` | — | — | — | `PRE_DEPLOY` migration job closes init-db |
| AWS ECS Fargate | `./deploy/aws/deploy.sh` | — | — | — | Full-stack image behind ALB |
| GCP Cloud Run | `./deploy/gcp/deploy.sh` | — | — | — | Full-stack image served same-origin |
| Azure Container Apps | `./deploy/azure/deploy.sh` | — | — | — | Full-stack image served same-origin |
| Railway | Railway project from `railway.toml` | — | — | — | Uses pre-deploy `init-db` command |
| Heroku | Heroku container app from `heroku.yml` + `app.json` | — | — | — | Uses release phase for `init-db` |
| Fly.io | `./deploy/fly/deploy.sh` | — | — | — | Parameterized backend/frontend app names |
