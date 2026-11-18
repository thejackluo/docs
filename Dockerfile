# Builds the Mintlify site as static files and serves it under /docs.
FROM public.ecr.aws/docker/library/node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends unzip ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY . .
RUN npx -y mint@4.3.56 export --base-path /docs --output /tmp/site.zip && mkdir /site && unzip -q /tmp/site.zip -d /site

FROM public.ecr.aws/docker/library/node:22-bookworm-slim
WORKDIR /app
COPY server.js .
COPY --from=build /site ./site
ENV PORT=3000
EXPOSE 3000
USER node
CMD ["node", "server.js"]
