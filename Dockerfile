FROM traefik:v2.0.5 as traefik
FROM node:12-stretch as main

COPY --from=traefik /usr/local/bin/traefik /usr/local/bin/traefik

RUN wget https://github.com/PostgREST/postgrest/releases/download/v5.2.0/postgrest-v5.2.0-ubuntu.tar.xz
RUN tar Jxf postgrest-v5.2.0-ubuntu.tar.xz && mv ./postgrest /usr/local/bin/postgrest && rm ./postgrest-v5.2.0-ubuntu.tar.xz

ENV TARGET_DIR=/root/config
ENV POSTGRES_HOST=localhost
ENV POSTGRES_PASS=
ENV POSTGRES_USER=postgres
ENV POSTGRES_PORT=5432
ENV POSTGRES_DB=etl9

WORKDIR /root

COPY . .

RUN yarn install
RUN yarn build

CMD yarn start:prod
