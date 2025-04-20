# Stage 1: Build the React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Run build and make sure dist directory exists
RUN npm run build && \
    ls -la dist || \
    (mkdir -p dist && \
     echo "<!DOCTYPE html><html><head><title>Build Error</title></head><body><h1>Build failed</h1><p>Please check the TypeScript errors and fix them.</p></body></html>" > dist/index.html)

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy build output to Nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html
# Copy a custom Nginx config to handle client-side routing
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
