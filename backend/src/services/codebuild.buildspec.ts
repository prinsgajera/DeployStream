// Sent with every StartBuild (buildspecOverride) so the repo, not the AWS console, is the source of truth.
export const BUILDSPEC = String.raw`version: 0.2

env:
  shell: bash

phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - corepack enable
  pre_build:
    commands:
      - |
        AUTH_B64=$(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 -w0)
        git -c "http.extraHeader=Authorization: Basic $AUTH_B64" clone --branch "$BRANCH" "https://github.com/$REPO_FULL_NAME.git" app
        unset GITHUB_TOKEN AUTH_B64
      - cd app
      - |
        if [ -n "$COMMIT_HASH" ]; then git checkout "$COMMIT_HASH"; fi
      - |
        if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true
        elif [ -f yarn.lock ]; then yarn install --frozen-lockfile
        elif [ -f package-lock.json ]; then npm ci
        else npm install; fi
  build:
    commands:
      - eval "$BUILD_CMD"
  post_build:
    commands:
      - test -d "$OUTPUT_DIR"
      - aws s3 sync "$OUTPUT_DIR" "s3://$S3_BUCKET/builds/$SUBDOMAIN/" --delete --exclude "*.html" --cache-control "public,max-age=300"
      - aws s3 sync "$OUTPUT_DIR" "s3://$S3_BUCKET/builds/$SUBDOMAIN/" --delete --exclude "*" --include "*.html" --cache-control "no-cache"
`;
