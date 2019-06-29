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
    context('no notes in database', () => {
      it('returns 404 when note does not exist', () => {
        const noteId = 12345
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .set(auth)
          .expect(404, {
            error: { message: `Note not found`}
          })
      });
    })
    context('notes in db', () => {
      const testFolders = makeFoldersArray()
      const testNotes = makeNotesArray()

      beforeEach('seed db', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('noteful_notes')
              .insert(testNotes)
          })
      })

      it('returns 404 when note does not exist', () => {
        const noteId = 12345
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .set(auth)
          .expect(404, {
            error: { message: `Note not found`}
          })
      });

      it('returns 200 and the note', function () {
        this.retries(3)
        const noteId = 1
        let expected = testNotes.filter(note => note.id == noteId)[0]
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .set(auth)
          .expect(200)
          .then(note => {
            expect(note.body.id).to.eql(expected.id)
            expect(note.body.content).to.eql(expected.content)
            expect(note.body.folder_id).to.eql(expected.folder_id)
            const actual = new Date(new Date()).toLocaleString()
            const expectedDate = new Date(new Date()).toLocaleString()
            expect(actual).to.eql(expectedDate)
          })
      });

    })
    
    
  })

  describe.only('PATCH /api/notes/:note_id', () => {
    context('there are no notes', () => {
      it('returns 404', () => {
        const note_id = 12345
        return supertest(app)
          .patch(`/api/notes/${note_id}`)
          .set(auth)
          .expect(404, {
            error: { message: `Note not found`}
          })
      });
    })

    context('there are notes in the db', () => {
      const testNotes = makeNotesArray()
      const testFolders = makeFoldersArray()

      beforeEach('seed db', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
          .then(()=> {
            return db
              .into('noteful_notes')
              .insert(testNotes)
          })
      })

      it('returns 404 when folder does note exists', () => {
        const idToUpdate = 12345
        return supertest(app)
          .patch(`/api/notes/${idToUpdate}`)
          .set(auth)
          .expect(404, {
            error: { message: `Note not found`}
          })
      });

      it('returns 400 when no required fields are provided', () => {
        const noteToUpdate = 2
        return supertest(app)
          .patch(`/api/notes/${noteToUpdate}`)
          .set(auth)
          .send({ irrelevantField: 'foo'})
          .expect(400, {
            error: { message: `Request body content must be one of note_name, folder_id, content` }
          })
      });

      it('responds with 400 when invalid folder id provided', () => {
        const noteIdToUpdate = 1
        const updatedNote = {
          note_name: "updated note 1",
          folder_id: 12345,
          content: "updated note 1 content..."
        }
        return supertest(app)
          .patch(`/api/notes/${noteIdToUpdate}`)
          .set(auth)
          .send(updatedNote)
          .expect(400, {
            error: { message: `Invalid folder id` }
          })

      });

      it('responds with 204 and updates the folder', function() {
        this.retries(3)
        const noteIdToUpdate = 1
        const updatedNote = {
          note_name: "updated note 1",
          folder_id: 1,
          content: "updated note 1 content..."
        }
        const newDate = { date_modified: new Date().toLocaleString()}
        const expectedNote = {
          ...testNotes[noteIdToUpdate -1],
          ...updatedNote,
          ...newDate
        }
        return supertest(app)
          .patch(`/api/notes/${noteIdToUpdate}`)
          .set(auth)
          .send(updatedNote)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/notes/${noteIdToUpdate}`)
              .set(auth)
              .expect(res => {
                expect(res.body.note_name).to.eql(expectedNote.note_name)
                expect(res.body.content).to.eql(expectedNote.content)
                expect(res.body).to.have.property('id')
                expect(res.body.folder_id).to.eql(expectedNote.folder_id)
                const actual = new Date(res.body.date_modified).toLocaleString()
                const expected = expectedNote.date_modified
                expect(actual).to.eql(expected)
              })  
          )
      });
    })
    
    
  })
  
  
  
})
