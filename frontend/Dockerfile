# Estágio de Compilação
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

FROM nginx:alpine
# Copia o build do angular
# O asterisco pega qualquer pasta que estiver dentro de dist
COPY --from=build /app/dist/*/ /usr/share/nginx/html/
# COPIE ESTA LINHA ABAIXO:
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]