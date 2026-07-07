# Builds an nginx image that serves the Angular frontend and reverse-proxies
# /api/* to the backend service. Expects the frontend to already be built
# (see frontend/angular.json outputPath: dist/aya-interviewer/browser).
#
# NOTE: backend and frontend are separate git repos. This image needs both
# checked out as siblings on disk (e.g. .../AyaInterviewer/backend,
# .../AyaInterviewer/frontend) — it will NOT build from a standalone clone
# of the backend repo alone.
#
# COPY paths below are relative to the build context, not this Dockerfile —
# build from the parent directory that contains both repos, e.g.:
#   docker build -f backend/docker/nginx/Dockerfile -t aya-nginx .
#
# The base image's own entrypoint scripts render nginx.conf.template with
# envsubst on startup, substituting BACKEND_HOST / BACKEND_PORT below.

FROM nginx:1.27-alpine

ENV BACKEND_HOST=backend
ENV BACKEND_PORT=3000

COPY backend/docker/nginx/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY frontend/dist/aya-interviewer/browser /usr/share/nginx/html

EXPOSE 80
