#!/bin/bash
export hostsever=sub3.omnitracs.online
export hostserverdns=subtest3.omnitracs.online
apt update
apt upgrade -y
apt-get install ca-certificates curl gnupg lsb-release -y
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
docker volume create portainer_data
docker run -d -p 30030:9000 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data \
-l traefik.http.routers.portainer.rule='Host(`portainer.${host_server}`)' \
-l traefik.http.routers.portainer.tls.certresolver=myresolver \
-l traefik.http.services.portainer.loadbalancer.server.port=30030 \
portainer/portainer-ce:latest
echo ".:53 {" >> /home/admin/Corefile
echo "  whoami" >> /home/admin/Corefile
echo "}" >> /home/admin/Corefile
echo "" >> /home/admin/Corefile
echo "${host_server}:53 {" >> /home/admin/Corefile
echo "  file /root/dns.db {" >> /home/admin/Corefile
echo "    reload 10s" >> /home/admin/Corefile
echo "  }" >> /home/admin/Corefile
echo "  log" >> /home/admin/Corefile
echo "  reload 10s" >> /home/admin/Corefile
echo "  erratic" >> /home/admin/Corefile
echo "}" >>  /home/admin/Corefile
echo "${host_server}.  300    IN  SOA ${hostserverdns}. mail.omnitracs.online. 2015082579 7200 3600 1209600 3600" >> /home/admin/dns.db
echo "*.${host_server}. 300   IN  A   18.220.65.12" >> /home/admin/dns.db
docker run -d --network host --name coredns --restart=always -v /home/admin:/root coredns/coredns:latest -conf /root/Corefile
docker run -d --name influxdb --restart=always  \
-e DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=super-secret-token-omnitracs \
-e DOCKER_INFLUXDB_INIT_BUCKET=bucket \
-e DOCKER_INFLUXDB_INIT_CLI_CONFIG_NAME=default \
-e DOCKER_INFLUXDB_INIT_MODE=setup \
-e DOCKER_INFLUXDB_INIT_ORG=omnitracs \
-e DOCKER_INFLUXDB_INIT_PASSWORD=testtest \
-e DOCKER_INFLUXDB_INIT_RETENTION=24h \
-e DOCKER_INFLUXDB_INIT_USERNAME=test \
-l traefik.http.routers.influxdb.rule='Host(`influxdb.${host_server}`)' \
-l traefik.http.routers.influxdb.tls.certresolver=myresolver \
-l traefik.http.services.influxdb.loadbalancer.server.port=8086 \
influxdb:2.0
docker container create --network host --name traefik --restart=always -v /home/admin:/config -v /var/run/docker.sock:/var/run/docker.sock \
-e RAEFIK_CERTIFICATESRESOLVERS_myresolver=true \
-e TRAEFIK_CERTIFICATESRESOLVERS_myresolver_ACME_EMAIL=irvin.vazquez@solera.com \
-e TRAEFIK_CERTIFICATESRESOLVERS_myresolver_ACME_STORAGE=/config/acme.json \
-e TRAEFIK_CERTIFICATESRESOLVERS_myresolver_ACME_TLSCHALLENGE=true \
-e TRAEFIK_ENTRYPOINTS_web=true \
-e TRAEFIK_ENTRYPOINTS_web_ADDRESS=:80 \
-e TRAEFIK_ENTRYPOINTS_web_HTTP_REDIRECTIONS_ENTRYPOINT_TO=websecure \
-e TRAEFIK_ENTRYPOINTS_websecure=true \
-e TRAEFIK_ENTRYPOINTS_websecure_ADDRESS=:443 \
-e TRAEFIK_PROVIDERS_DOCKER=true \
traefik:latest
