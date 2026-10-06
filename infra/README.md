# DeployStream AWS setup (free tier, static sites)

Region: **us-east-1** for everything. Replace `<ACCOUNT_ID>` with your 12-digit AWS account ID.
Do all console steps signed in as the account owner/admin with MFA. Never use root access keys in `backend/.env`.

## 0. Cost guardrail (do first)
Billing → Budgets → Create budget → Zero-spend or monthly cost budget of **$1**, email alert.

## 1. S3 bucket
- Name `deploystream-client-builds`, **Block all public access ON**, default encryption on.
- Management → Lifecycle rule: delete incomplete multipart uploads after 1 day.

## 2. CloudWatch log group
- `/aws/codebuild/deploystream-build-runner`, retention **7 days**.

## 3. CodeBuild project `deploystream-build-runner`
- Source: **No source**. Buildspec: paste `infra/buildspec.yml` (Insert build commands → Switch to editor).
- Environment: Managed image, Amazon Linux, Standard runtime, image `aws/codebuild/amazonlinux-x86_64-standard:5.0` (or latest), compute **Linux small (3 GB, 2 vCPU)**.
- Service role: create new. Then IAM → that role → Add inline policy → `infra/iam-codebuild-s3-policy.json`.
- Additional configuration: timeout **10 minutes**, queued timeout 5 minutes. Logs: CloudWatch, group name from step 2.
- Project settings → concurrent build limit **1** (Edit project → Additional configuration, if shown).

## 4. ACM certificate (must be us-east-1 for CloudFront)
- Request public certificate for `*.gajeraprins.shop`, DNS validation.
- In Cloudflare → DNS, add the CNAME ACM shows, **Proxy status: DNS only (grey cloud)**. Wait until status is Issued.

## 5. CloudFront
- Create distribution: origin = the S3 bucket (REST endpoint), Origin access = **Origin access control** (create new), cache policy `CachingOptimized`, Viewer protocol policy Redirect HTTP to HTTPS, **price class: North America & Europe** (cheapest).
- Alternate domain name `*.gajeraprins.shop`, custom SSL certificate from step 4, default root object empty.
- Functions → Create function from `infra/cloudfront-function.js`, publish, associate as **Viewer request** on the default behavior.
- Copy the bucket policy CloudFront offers for OAC into the S3 bucket policy.
- Note the distribution ID and `dxxxx.cloudfront.net` domain.

## 6. Cloudflare DNS
- `*` CNAME → `dxxxx.cloudfront.net`, **DNS only (grey cloud)**.
- Specific records (e.g. `app`, `api`) later override the wildcard automatically.

## 7. Backend IAM user
- IAM → Users → `deploystream-backend` (no console access) → Attach policy → create policy from `infra/iam-backend-policy.json` (replace `<ACCOUNT_ID>`).
- Security credentials → Create access key → "Application running outside AWS" → put in `backend/.env` as `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`. Delete any older key.

## 8. Webhooks in local development
GitHub cannot reach `localhost`. Run a tunnel, e.g. `cloudflared tunnel --url http://localhost:3001`, and set
`PUBLIC_API_URL=https://<random>.trycloudflare.com` in `backend/.env`. Webhooks are created when a repository is imported.
The quick-tunnel URL changes each run, so re-import (or update the hook) after restarting it.

## Smoke test
1. Import a public Vite repo from the dashboard, then trigger a deploy.
2. Build status goes QUEUED → BUILDING → SUCCESS (poller checks every 10s).
3. `aws s3 ls s3://deploystream-client-builds/builds/<subdomain>/` shows files; `https://<subdomain>.gajeraprins.shop` loads.
