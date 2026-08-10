# Vite dev server, matching the admin dashboard's container.
# vite.config.js pins the dev port to 3000, so that is what this exposes.
FROM node:22-alpine

WORKDIR /app

# Dependencies first, so editing source does not reinstall them.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

# --host binds 0.0.0.0; without it Vite listens on loopback inside the container
# and the published port answers nothing.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
