FROM node:14-slim
WORKDIR /usr/src/app
COPY . .
RUN npm install
# Label para interfaz traefik
LABEL traefik.http.routers.irvin.rule="Host(`irvin.sub.omnitracs.online`)"
LABEL traefik.http.routers.irvin.tls.certresolver="myresolver"
LABEL traefik.http.services.irvin.loadbalancer.server.port="80"
# Env para configurar conexiones
ENV TEST="No"
ENV ip_queue="conector:conector@rabbitmq"
ENV redis="redis"
ENV queue="irvin"
ENV port="3428"
ENV app_name="APP_irvin_"
ENV prefetch="1"
CMD [ "node", "main.js" ]
