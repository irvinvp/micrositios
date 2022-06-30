# Micrositios Demo
![flujo](https://github.com/irvinvp/micrositios/actions/workflows/main.yml/badge.svg)

Proyecto generico para creacion de Micrositios.
## Proceso de instalación
```
docker build -t micrositios .
```
## Imagenes adicionales
- redis
- rabbitmq:management

## Variables de entorno
- **TEST**: *Si es igual a test, desactiva el servidor HTTP y RabbitMQ*
- **ip_queue**: *Debe contener el usuario password y dirección de la instancia local o remota de RabbitMQ*
- **redis**: *Debe contener la dirección local o remota del servidor de REDIS*
- **queue**: *Nombre de la queue de consumo de datos*
- **port**: *Puerto de escucha para el servidor HTTP*
- **app_name**: *Nombre de la aplicación para uso en REDIS*
- **prefetch**: *Cantidad de mensajes pendientes enviados por RabbitMQ*
