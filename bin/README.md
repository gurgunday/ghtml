Lets you append unique hashes to assets referenced in your views to aggressively cache them while guaranteeing that clients receive the most recent versions.

## Usage

Running the following command will scan asset files found in the `roots` path(s) and replace their references in the `refs` path(s) with hashed versions:

```sh
npx ghtml --roots="base/path/to/scan/assets/1/,base/path/to/scan/assets/2/" --refs="views/path/to/append/hashes/1/,views/path/to/append/hashes/2/"
```

## Example (Fastify)

Register `@fastify/static`:

```js
await fastify.register(import("@fastify/static"), {
  root: new URL("assets/", import.meta.url).pathname,
  prefix: "/p/assets/",
  wildcard: false,
  index: false,
  immutable: true,
  maxAge: process.env.NODE_ENV === "production" ? 31536000 * 1000 : 0,
});
```

Add the `ghtml` command to the build script:

```json
"scripts": {
  "build": "npx ghtml --roots=assets/ --refs=views/,routes/",
},
```

Make sure to `npm run build` in `Dockerfile`:

```dockerfile
FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm ci --include=dev

COPY . .

RUN npm run build

RUN npm prune --omit=dev

CMD ["npm", "start"]
```

## Demo

A full project that uses the `ghtml` executable can be found in the `example` folder:

```sh
cd example

npm i

npm run build

node .
```
