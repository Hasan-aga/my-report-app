# Build stage
FROM node:18-alpine as build

# Accept build arguments for commit info
ARG COMMIT_SHA="unknown"
ARG COMMIT_MESSAGE="unknown"

# Expose commit info to Vite
ENV VITE_COMMIT_SHA=$COMMIT_SHA \
    VITE_COMMIT_MESSAGE=$COMMIT_MESSAGE

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]