FROM node:10-alpine

# Installs latest Chromium package.
RUN apk add --no-cache \
  --repository http://nl.alpinelinux.org/alpine/edge/community \
  --repository http://nl.alpinelinux.org/alpine/edge/main

RUN apk update && apk upgrade \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories \
    && apk add --no-cache \
    chromium@edge \
    nss@edge \
    && rm -rf /var/lib/apt/lists/* \
    /var/cache/apk/* \
    /usr/share/man \
    /tmp/*

# Add user so we don't need --no-sandbox.
ARG UID=1000
ARG GID=1000

# change node user UID/GID
RUN if [ "$UID" != "$(id -u node)" ] ; then \
  deluser --remove-home node \
  && addgroup -S node -g $GID \
  && adduser -S -G node -u $UID node; \
fi
# change node user UID/GID
RUN mkdir -p /home/node/Downloads /app \
  && chown -R node:node /app

# Run everything after as non-privileged user.
USER node

VOLUME /app

WORKDIR /app
