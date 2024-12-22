FROM nginx:alpine

# Copy static files
COPY recipe-server-backend/recipes.json /usr/share/nginx/html/recipes.json
COPY recipe-server-backend/cards /usr/share/nginx/html/cards
COPY recipe-server-backend/images-small /usr/share/nginx/html/images/small
COPY recipe-server-backend/images-large /usr/share/nginx/html/images/large

# Copy nginx configuration
COPY recipe-server-backend/nginx.conf /etc/nginx/conf.d/default.conf
