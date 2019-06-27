const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray, makeNotesArray } = require('./test.fixtures')

const auth = {"Authorization": "Bearer " + process.env.API_TOKEN}

describe('Notes Endpoints', () => {
  let db
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from the db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

  describe('GET /api/notes', () => {
    context('Given no notes', () => {
      it('returns with 200 and an empty array', () => {
        return supertest(app)
          .get('/api/notes')
          .set(auth)
          .expect(200, [])
      });
    })
    
  })
  
})
