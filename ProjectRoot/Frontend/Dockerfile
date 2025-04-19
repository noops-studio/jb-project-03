# Stage 1: Build the React app
FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy build output to Nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html
# Copy a custom Nginx config to handle client-side routing
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
