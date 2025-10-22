FROM node:24.10-alpine AS base

ARG CI

RUN apk add --no-cache libc6-compat


FROM base AS base-with-pnpm

ENV CI=${CI}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN [ "$CI" != "true" ] && \
  npm config set registry https://registry.npmmirror.com || true

RUN npm install -g pnpm


FROM base-with-pnpm AS builder

WORKDIR /app

COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install

RUN pnpm run build


FROM base AS runner

USER node

WORKDIR /app

COPY --from=builder --chown=node:node /app/.output ./.output

ENTRYPOINT ["node", ".output/server/index.mjs"]

EXPOSE 3000
