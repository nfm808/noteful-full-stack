const app = require('../src/app')

describe('App', () => {
  const auth = {"Authorization": "Bearer " + process.env.API_TOKEN }
  it('GET / responds with 200 containing "Hello, world!"', () => {
    return supertest(app)
      .get('/')
      .set(auth)
      .expect(200, 'Hello, world!')
  })
  it('returns 401: unauthorized without auth headers', () => {
    return supertest(app)
      .get('/')
      .expect(401, {
         error: 'Unauthorized request'
      })
  });
})