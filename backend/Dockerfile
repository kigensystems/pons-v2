# Plum launch API. Build context is backend/; the SQLite file and uploads live on a mounted volume
# (PLUM_DB_PATH, PLUM_UPLOAD_DIR). Credentials arrive as environment variables, never in the image.
FROM node:24-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
ENV NODE_ENV=production PLUM_HOST=0.0.0.0 PLUM_API_PORT=8787
EXPOSE 8787
CMD ["node", "--disable-warning=ExperimentalWarning", "src/server.ts"]
