const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray, makeNotesArray } = require('../test/test.fixtures')

describe('Folders Endpoints', () => {
  let db
  const auth = {"Authorization": "Bearer " + process.env.API_TOKEN}
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from the db', () => db.destroy())
  
  before('clean the table', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))

  describe('GET /api/folders', () => {
    context('Given no folders', () => {
      it('responds with 200 and empty array', () => {
        return supertest(app)
          .get('/api/folders')
          .set(auth)
          .expect(200, [])
      });
    })
  })
})

