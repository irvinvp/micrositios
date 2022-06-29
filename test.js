var main = require("./main.js");
var assert = require("assert");
describe("Test service_queue()", function () {
  it("Funcion de guardado debe regresar true", async function () {
    assert.equal(await main.service_queue("84051234567890"), true);
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
});
