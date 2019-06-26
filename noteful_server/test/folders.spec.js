const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray, makeNotesArray } = require('../test/test.fixtures')

const auth = {"Authorization": "Bearer " + process.env.API_TOKEN}

describe('Folders Endpoints', () => {
  let db
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
    context('Given there are folders', () => {
      const testFolders = makeFoldersArray()
      const testNotes = makeNotesArray()

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('noteful_notes')
              .insert(testNotes)
          })
      })

      it('returns 200 and an array of folders', () => {
        return supertest(app)
          .get('/api/folders')
          .set(auth)
          .expect(200, testFolders)
      });
    })  
  })

  describe('DELETE /api/folders/:folder-id', () => {
    context('Given the folder does not exist', () => {
      it('responds 404 and an error message', () => {
        const folderID = 12345
        return supertest(app)
          .delete(`/api/folders/${folderID}`)
          .set(auth)
          .expect(404, {
            error: { message: `Folder doesn't exist`}
          })
      });
    })    
  })
  
})

