FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY server.mjs ./
EXPOSE 4300
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4300
USER node
CMD ["node", "server.mjs"]
