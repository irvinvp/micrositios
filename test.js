var main = require("./main.js");
var assert = require("assert");
describe("Test service_queue()", function () {
  it("Funcion de guardado debe regresar true", async function () {
    assert.equal(
      await main.service_queue(
        "830512345678900101010266C062BD21B062BD21B00F5DD06BBF06779D0000000000" +
          "00000000000A000032FFAF6F0AFE002E6B100001000003000000000000000003C5D2" +
          "A3004E2261000030E4000000000000000000003E7000003E7000003E7000003E7000" +
          "0000000043C5CF0000000000000000"
      ),
      true
    );
  });
  it("Funcion debe regresar false con datos erroneos", async function () {
    assert.equal(await main.service_queue(""), false);
  });
});
describe("Test service_api()", function () {
  it("Debe regresar 404 al no existir la pagina", async function () {
    let url = new URL("http://test.com");
    assert.equal(
      await (
        await main.service_api("/desconocida", "GET", url.searchParams, "")
      ).status,
      404
    );
  });
  it("Debe regresar 200 al cargar la pagina inicial", async function () {
    let url = new URL("http://test.com");
    assert.equal(
      await (
        await main.service_api("/", "GET", url.searchParams, "")
      ).status,
      200
    );
  });
  it("Debe regresar 200 al cargar la pagina API", async function () {
    let url = new URL("http://test.com");
    assert.equal(
      await (
        await main.service_api("/api", "GET", url.searchParams, "")
      ).status,
      200
    );
  });
  it("Debe regresar 200 al cargar openapi.js", async function () {
    let url = new URL("http://test.com");
    assert.equal(
      await (
        await main.service_api("/openapi.json", "GET", url.searchParams, "")
      ).status,
      200
    );
  });
  it("Test /api/v1/last_position debe devolver JSON serial", async function () {
    let url = new URL("http://test.com?serial=123456789");
    assert.equal(
      JSON.parse(
        (
          await main.service_api(
            "/api/v1/last_position",
            "GET",
            url.searchParams,
            ""
          )
        ).data
      ).serial,
      "123456789"
    );
  });
  it("Test /api/v1/last_position debe devolver JSON message", async function () {
    let url = new URL("http://test.com?serial=1234567890");
    assert.ok(
      JSON.parse(
        (
          await main.service_api(
            "/api/v1/last_position",
            "GET",
            url.searchParams,
            ""
          )
        ).data
      ).message
    );
  });
  it("Close redis", async function () {
    assert.ok(main.client.quit());
  });
});
