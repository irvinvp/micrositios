# Micrositios Demo
![flujo](https://github.com/irvinvp/micrositios/actions/workflows/main.yml/badge.svg)

Proyecto generico para creacion de Micrositios.
## Proceso de instalación
```
docker build -t micrositios .
```
## Funciones a modificar
Dentro de **main.js** existen dos funciones que deben modificarse para expandir y adaptar el Micrositio.
- **service_api**: *Recibe cuatro variables (path, method, params, body) las cuales contiene la información de las peticiones realizadas a la API y debe entregar headers data y status al cliente.*
- **service_queue**: *Recibe el mesaje de la queue (msg) en formato de texto y debe guardar los datos trasformados en redis y regresar true si los datos fueron guardados con exito en la base de datos*.
## Imagenes adicionales
- redis
- rabbitmq:management
## Variables de entorno
- **TEST**: *Si es igual a test, desactiva el servidor HTTP y RabbitMQ*.
- **ip_queue**: *Debe contener el usuario password y dirección de la instancia local o remota de RabbitMQ*.
- **redis**: *Debe contener la dirección local o remota del servidor de REDIS*.
- **queue**: *Nombre de la queue de consumo de datos*.
- **port**: *Puerto de escucha para el servidor HTTP*.
- **app_name**: *Nombre de la aplicación para uso en REDIS*.
- **prefetch**: *Cantidad de mensajes pendientes enviados por RabbitMQ*.
