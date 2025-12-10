FROM node:20 AS build-env

# Create label to identify services easily (e.g. in logging)
LABEL service="asralpha-ui"

# Install yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash

# disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

# Set up gcloud credentials
COPY gcloud-service-key.json ./
ENV GOOGLE_APPLICATION_CREDENTIALS=./gcloud-service-key.json
COPY .npmrc ./
RUN npx google-artifactregistry-auth --repo-config .npmrc --credential-config .npmrc \
  && yarn install

COPY . .

RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app

# Mark as prod, disable telemetry, set port
ENV NODE_ENV=production PORT=3995 NEXT_TELEMETRY_DISABLED=1

COPY --from=busybox:1.35.0-uclibc /bin/sh /bin/sh
COPY --from=build-env /app/next.config.mjs ./
COPY --from=build-env /app/public ./public
COPY --from=build-env /app/.next ./.next
COPY --from=build-env /app/node_modules ./node_modules

EXPOSE 3995
CMD ["./node_modules/next/dist/bin/next", "start"]
