FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
# Принимаем переменные как build args
ARG VITE_API
ARG VITE_REDIRECT_URI
ARG GOOGLE_FONTS_API_KEY
ARG UNSPLASH_ACCESS_KEY
ARG COLOR_API_BASE_URL
# Делаем их доступными для npm run build
ENV VITE_API=$VITE_API
ENV GOOGLE_FONTS_API_KEY=$GOOGLE_FONTS_API_KEY
ENV UNSPLASH_ACCESS_KEY=$UNSPLASH_ACCESS_KEY
ENV COLOR_API_BASE_URL=$COLOR_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_REDIRECT_URI=$VITE_REDIRECT_URI
RUN npm run build

FROM node:20-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]