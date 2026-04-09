FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Use Vite dev server to avoid aggressive static caching during development
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "80"]
