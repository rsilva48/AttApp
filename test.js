const request = require("supertest");
const assert = require("assert");
const { app, server, httpServer, httpsServer } = require("./server.js");
describe("GET /", function () {
  it("responds with 200", function (done) {
    request(app).get("/").expect(200, done);
  });

  after(function (done) {
    if (httpServer) {
      httpServer.close(() => {
        done();
      });
    } else {
      done();
    }
  });
});
describe("GET /", function () {
  it("responds with 200", function (done) {
    request(server)
      .get("/")
      .trustLocalhost() //Confia en el certificado autofirmado
      .expect(200, done);
  });

  after(function (done) {
    if (httpsServer) {
      httpsServer.close(() => {
        done();
      });
    } else {
      done();
    }
  });
});
