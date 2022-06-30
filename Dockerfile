FROM node:14-slim
WORKDIR /usr/src/app
COPY . .
RUN npm install
# De las siguientes equiquetas cambiar "irvin-" por el nombre del contenedor ejemplo "test-"
# Label para interfaz traefik HTTP
LABEL traefik.http.routers.irvin.rule="Host(`irvin.sub.omnitracs.online`)"
LABEL traefik.http.routers.irvin.tls.certresolver="myresolver"
LABEL traefik.http.services.irvin.loadbalancer.server.port="3428"
# Label para control de flujo y limites
LABEL traefik.http.middlewares.irvin-ratelimit.ratelimit.average="5"
LABEL traefik.http.middlewares.irvin-inflightreq.inflightreq.amount="50"
LABEL traefik.http.middlewares.irvin-compress.compress="true"
# Label para acceso de CORS
LABEL traefik.http.middlewares.irvin-headers.headers.accessControlAllowHeaders="*"
LABEL traefik.http.middlewares.irvin-headers.headers.accessControlAllowMethods="GET,OPTIONS,POST,PUT,DELETE,HEAD"
LABEL traefik.http.middlewares.irvin-headers.headers.accesscontrolalloworiginlist="*"
# Carga de middlewares
LABEL traefik.http.routers.irvin.middlewares="irvin-ratelimit,irvin-compress,irvin-inflightreq,irvin-headers"
# Env para configurar conexiones
ENV TEST="No"
ENV ip_queue="conector:conector@rabbitmq"
ENV redis="redis://redis"
ENV queue="irvin"
ENV port="3428"
ENV app_name="APP_irvin_"
ENV prefetch="1"
CMD [ "node", "main.js" ]
