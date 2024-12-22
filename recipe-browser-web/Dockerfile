# Build frontend
FROM node:18 AS builder

WORKDIR /app
COPY recipe-browser-web/package*.json ./
RUN npm install
COPY recipe-browser-web .

RUN export VITE_RECIPES_JSON_URL=/backend/recipes.json && \
    export VITE_RECIPE_CARD_BASE_URL=/backend/cards/ && \
    export VITE_LARGE_IMAGE_BASE_URL=/backend/images/large/ && \
    export VITE_SMALL_IMAGE_BASE_URL=/backend/images/small/ && \
    npm run build

# Final image
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY recipe-browser-web/nginx.conf /etc/nginx/conf.d/default.conf
