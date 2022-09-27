FROM node:dubnium-alpine

# Install build dependencies
RUN apk add --no-cache --virtual .gyp \
  python \
  make \
  g++ \
  git \
  linux-headers bash openssh musl build-base ca-certificates

# Add working directory in the docker container
WORKDIR /usr/src/app

# Add package file
COPY package*.json ./

# Install deps
RUN npm i

# Copy source
COPY . .

# Build dist
RUN npm run build

# Expose port 80
EXPOSE 80

CMD npm run start
