const dgram = require("dgram");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const amqp = require("amqplib/callback_api");
const ip_queue = ":@127.0.0.1:5672";
const exchange = "amq.direct";
const queue = "events";
const port = 8080;
let call_sql1;
const udp_port_sql1 = process.env.udp_port_sql1 || 9014;
const server_sql1 = dgram.createSocket("udp4");
server_sql1.on("message", (msg, rinfo) => {
  try {
    msg = JSON.parse(msg);
    call_sql1.write({
      query: msg.query,
      db: msg.db,
      res: "",
      port: rinfo.port,
      ip: rinfo.address,
    });
  } catch (e) {}
});
server_sql1.bind(udp_port_sql1);

async function run(channel) {
  const p3 = protoLoader.loadSync("proto3.proto");
  const nodeProto = grpc.loadPackageDefinition(p3);
  const server = new grpc.Server();
  async function list(call, callback) {
    let serv_ = [];
    for (let x in call.request.data) {
      serv_.push(
        service(call.request.data[x].toString("hex").toUpperCase(), channel)
      );
    }
    await Promise.all(serv_);
    callback(null, { tag: call.request.tag });
  }
  function sql(call, callback) {
    call.on("data", function (data) {
      server_sql1.send(
        JSON.stringify({ query: data.query, db: data.db, res: data.res }),
        data.port,
        data.ip
      );
    });
    call_sql1 = call;
  }
  server.addService(nodeProto.NodeService.service, {
    list: list,
    sql: sql,
  });
  server.bindAsync(
    "0.0.0.0:" + port.toString(),
    grpc.ServerCredentials.createInsecure(),
    () => {
      server.start();
    }
  );
}
async function service(msg, channel) {
  channel.publish(exchange, queue, Buffer.from(msg));
}
amqp.connect("amqp://" + ip_queue, function (error0, connection) {
  if (error0) {
    console.log("e0", error0);
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      console.log("e1", error1);
    }
    setTimeout(function () {
      run(channel);
    }, 1000);
  });
});
