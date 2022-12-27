# AniDB API

## Setup
- Copy .env.sample to create .env
- Fill out credentials
- `deno task dev`

## Build Docker Image for scheduler
- Copy `Dockerfile.schedule.sample` to `Dockerfile.schedule`
- Replace the ENV variables for your setup
- Run `docker build -t anidb-scheduler:1 -f Dockerfile.schedule .` to build

## Build Docker Image for cli
- Copy `Dockerfile.cli.sample` to `Dockerfile.cli`
- Replace the ENV variables for your setup
- Run `docker build -t anidb-cli:1 -f Dockerfile.cli .` to build
