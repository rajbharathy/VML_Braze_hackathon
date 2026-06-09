#!/bin/sh
set -e

PROJECT_ID="vml-map-hackathon"
REGION="europe-west1"
SERVICE="braze-copilot"
AR_REPO="cloud-run-source-deploy"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/${SERVICE}"

# Load env vars from config.env if present (local use only — never commit secrets)
if [ -f config.env ]; then
  export $(grep -v '^#' config.env | xargs)
fi

# ── GCP auth ──────────────────────────────────────────────────────────────────
# Check if already authenticated
if ! gcloud auth list --filter="status:ACTIVE" --format="value(account)" 2>/dev/null | grep -q "@"; then
  echo "No active GCP account found. Logging in..."
  gcloud auth login
fi

# Set project
gcloud config set project "${PROJECT_ID}"

# Authenticate Docker to push to Artifact Registry
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com \
  --project "${PROJECT_ID}"

# Create Artifact Registry repo if it doesn't exist
gcloud artifacts repositories create "${AR_REPO}" \
  --repository-format=docker \
  --location="${REGION}" \
  --project="${PROJECT_ID}" \
  --quiet 2>/dev/null || true

# Grant Artifact Registry Writer to both SAs Cloud Build relies on
PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format="value(projectNumber)")

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer" \
  --quiet

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/artifactregistry.writer" \
  --quiet

echo "Building and pushing image..."
gcloud builds submit --tag "${IMAGE}" --project "${PROJECT_ID}"

echo "Deploying to Cloud Run..."
gcloud run deploy "${SERVICE}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --platform managed \
  --set-env-vars "BRAZE_API_KEY=${BRAZE_API_KEY},\
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY},\
BRAZE_REST_ENDPOINT=${BRAZE_REST_ENDPOINT},\
BRAZE_DASHBOARD_ENDPOINT=${BRAZE_DASHBOARD_ENDPOINT}" \
  --project "${PROJECT_ID}"

echo "Done. Service URL:"
gcloud run services describe "${SERVICE}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --format "value(status.url)"
