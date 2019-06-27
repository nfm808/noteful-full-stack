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
    context('Given there are notes', () => {
      const testFolders = makeFoldersArray()
      const testNotes = makeNotesArray()

      beforeEach('seed database', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('noteful_notes')
              .insert(testNotes)
          })
      })

      it('it returns 200 and an array of notes', () => {
        return supertest(app)
          .get('/api/notes')
          .set(auth)
          .expect(200)
          .then(res => {
            const actual = res.body.map(note => Object.keys(note))
            const expected = testNotes.map(note => Object.keys(note))
            expect(actual).to.eql(expected)
          })
      });
    })
  })
  
  describe('POST /api/notes', () => {
    context('Given there are no notes', () => {
      const newNote = {
        note_name: 'test add note',
        date_modified: '2019-01-03T00:00:00.000Z',
        folder_id: 1,
        content: 'test note content...'
      }
      return supertest(app)
        .post('/api/notes')
        .set(auth)
        .send(newNote)
        .expect(201, newNote)
    })
    
  })
  
})
