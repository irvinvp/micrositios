FROM httpd:2.4
COPY . /usr/local/apache2/htdocs/
LABEL traefik.http.routers.irvin.rule="Host(`irvin.sub.omnitracs.online`)"
LABEL traefik.http.routers.irvin.tls.certresolver="myresolver"
LABEL traefik.http.services.irvin.loadbalancer.server.port="80"
