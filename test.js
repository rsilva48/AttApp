const request = require('supertest');
const assert = require('assert');
const app = require('./server.js');
describe('GET /', function() {
  it('responds with 200', function(done) {
    request(app)
      .get('/')
      .expect(200, done);
  });
});