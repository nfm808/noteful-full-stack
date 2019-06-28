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
    const testFolders = makeFoldersArray()

    beforeEach('seed folders db', () => {
      return db
       .insert(testFolders)
       .into('noteful_folders')
    })
    context('Given there are no notes', () => {
      it('returns 201 and the new note', function () {
        this.retries(3)
        const newNote = {
          note_name: 'test add note',
          folder_id: 1,
          content: 'test note content...'
        }
        return supertest(app)
          .post('/api/notes')
          .set(auth)
          .send(newNote)
          .expect(201)
          .then(res => {
            const { note_name, folder_id, content } = res.body
            expect(res.body).to.have.property('id')
            expect(note_name).to.eql(newNote.note_name)
            expect(content).to.eql(newNote.content)
            expect(folder_id).to.eql(newNote.folder_id)
            expect(res.body).to.have.property('date_modified')
          })
      })  
    });
    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray()

      beforeEach('seed note db', () => {
        return db
          .insert(testNotes)
          .into('noteful_notes')
      })
      const requiredFields = ['note_name', 'folder_id', 'content']

      requiredFields.forEach(field => {
        const newNote = {
          note_name: 'Test new note',
          folder_id: 1,
          content: 'test new note content...'
        }

        it(`responds with 400 and an error when ${field} is missing`, () => {
          delete newNote[field]

          return supertest(app)
            .post('/api/notes')
            .set(auth)
            .send(newNote)
            .expect(400, {
              error: { message: `Missing '${field}' in request body`}
            })
        })
      })

      it('responds 400 when note_name already exists', () => {
        const newNote = {
          note_name : 'note 1',
          folder_id : 1,
          content: 'new note content...'
        }
        return supertest(app)
          .post('/api/notes')
          .set(auth)
          .send(newNote)
          .expect(400, {
            error: { message: `Note name must be unique`}
          })
      });

      it('returns 400 if folder_id does not exist', () => {
        const newNote = {
          note_name: 'test note',
          folder_id: 12345,
          content: 'test note content ...'
        }
        return supertest(app)
          .post('/api/notes')
          .set(auth)
          .send(newNote)
          .expect(400, {
            error: { message: `Folder does not exist`}
          })
      });
    })
  })

  describe('GET /api/notes/:note_id', () => {
    context('note does not exist', () => {
      
    })
    
  })
  
  
})
