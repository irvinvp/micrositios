const http = require("http");
const fs = require("fs");
const redis = require("redis");
const amqp = require("amqplib/callback_api");

// #################################   EDITAR SOLO ESTA PARTE  ################################################
const ip_queue = process.env.ip_queue || "conector:conector@localhost"; // servidor de queue
const queue = process.env.queue || "irvin"; // Queue de informacion
const port = parseInt(process.env.port) || 3428; // puerto de escucha
const app_name = process.env.app_name || "APP_irvin_"; // nombre de la aplicacion
const prefetch = parseInt(process.env.prefetch) || 1; // Mensajes por vez

async function service_api(path, method, params, body) {
  let res = { headers: {}, data: "", status: 200 };
  let DB;
  switch (path) {
    case "/": // Index
      res.status = 200;
      res.headers = { "Content-Type": "text/html" };
      res.data = fs.readFileSync("./index.html");
      break;
    case "/api": // API documentation
      res.status = 200;
      res.headers = {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*",
      };
      res.data = fs.readFileSync("./api.html");
      break;
    case "/openapi.json": // API documentation
      res.status = 200;
      res.headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      };
      res.data = fs.readFileSync("./openapi.json");
      break;
    case "/api/v1/last_position": // API service
      if (method === "GET" && params.has("serial")) {
        res.status = 200;
        res.headers = {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        };
        DB = await client.hGet(
          app_name + "last_position",
          params.get("serial")
        );
        res.data = JSON.stringify({
          message: DB,
          serial: params.get("serial"),
        });
      } else {
        res.status = 501;
        res.headers = {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        };
        res.data = JSON.stringify({
          message: "Falta parametro serial",
          serial: params.get("serial"),
        });
      }
      break;
    default:
      res.status = 404;
      res.headers = { "Content-Type": "text/plain" };
      res.data = "Not found";
      break;
  }
  return res;
}
async function service_queue(msg) {
  if (msg.length >= 14) {
    let serial = msg.substring(4, 14);
    let res = await client.hSet(
      app_name + "last_position",
      serial,
      new Date().toISOString()
    );
    return res == 0 || res == 1 ? true : false;
  } else {
    return false;
  }
}
// ##############################################################################################################

// NO EDITAR #################################################################################################
let client = redis.createClient({ host: process.env.redis || "localhost" });
client.connect();
if (process.env.TEST != "test") {
  console.log("Iniciando servidor");
  // Server
  http
    .createServer(async (req, res) => {
      let url = new URL(req.url, `http://${req.headers.host}`);
      let path = url.pathname;
      let method = req.method;
      let params = url.searchParams;
      let body = [];
      req.on("data", (chunk) => {
        body.push(chunk);
      });
      req.on("end", async () => {
        body = Buffer.concat(body).toString();
        let respuesta = await service_api(path, method, params, body);
        res.writeHead(respuesta.status, respuesta.headers);
        res.end(respuesta.data);
      });
    })
    .listen(port);
  // RabbitMQ
  amqp.connect("amqp://" + ip_queue, function (error0, connection) {
    if (error0) console.log("e0", error0);
    connection.createChannel(function (error1, channel) {
      if (error1) console.log("e1", error1);
      channel.prefetch(prefetch);
      channel.consume(queue, async function (msg) {
        await service_queue(msg.content.toString());
        channel.ack(msg);
      });
    });
  });
}
module.exports = { service_api, service_queue };
