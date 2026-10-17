---
paths:
  - "infra/**"
  - "backend/src/services/**"
  - "backend/src/config/**"
  - "backend/.env.example"
---

# AWS and Infrastructure

## Scope and cost
- Static-site hosting only (build command + output directory). No long-running servers, no EC2/ECS/NAT/RDS or anything outside the free tier without explicit approval.
- Guardrails: CodeBuild `BUILD_GENERAL1_SMALL`, 10-minute build timeout, concurrency 1; CloudWatch log retention 7 days; S3 lifecycle for incomplete uploads; $1 AWS Budget alert. No CloudFront invalidations by default; HTML is uploaded with `no-cache`, assets with a short max-age.
- DNS is on Cloudflare (free). Route 53 hosted zones cost money; do not introduce them.

## Regions
- `ap-south-1` (Mumbai): S3 bucket, CodeBuild project, CloudWatch log group (`AWS_REGION`).
- `us-east-1`: the ACM certificate for `*.gajeraprins.shop` only (CloudFront requirement).
- CloudFront, IAM and Budgets are global.

## Resources and names
- S3 `deploystream-client-builds`, objects under `builds/<subdomain>/` (`buildS3KeyPrefix`), private with CloudFront OAC.
- CodeBuild `deploystream-build-runner`, source `NO_SOURCE`, inline buildspec from `infra/buildspec.yml`. The backend overrides these env vars per build: `REPO_FULL_NAME`, `BRANCH`, `COMMIT_HASH`, `SUBDOMAIN`, `BUILD_CMD`, `OUTPUT_DIR`, `S3_BUCKET`, `GITHUB_TOKEN`, plus the user's own env vars (reserved names and `CODEBUILD_*` are filtered).
- Log group `/aws/codebuild/deploystream-build-runner`.
- One CloudFront distribution with alternate domain `*.gajeraprins.shop` and the viewer-request function in `infra/cloudfront-function.js` (Host subdomain -> `/builds/<sub>/...`, SPA fallback to `index.html`).
- Runbook for creating all of this by hand: `infra/README.md`. Keep it and the policy JSON in sync with code changes.

## IAM and credentials
- Root account only for first-time setup (MFA, billing-access toggle, creating the IAM admin user). All other console work uses the IAM admin user with MFA.
- Backend runtime uses an IAM user with the least-privilege policy in `infra/iam-backend-policy.json` (CodeBuild start/stop/get, log read, S3 list/delete under `builds/*`). CodeBuild's service role gets `infra/iam-codebuild-s3-policy.json` plus its auto-created log permissions.
- Update the policy JSON whenever the backend starts using a new AWS API.
- Access keys exist only in gitignored `backend/.env`. Never ask for, echo, log or commit AWS keys, GitHub secrets or tokens. Ask the user for non-secret identifiers (account ID, distribution ID/domain) instead.
- The user's GitHub token reaches CodeBuild as a plain env var (visible in build details). Accepted for this learning project; do not extend that pattern to other secrets.
