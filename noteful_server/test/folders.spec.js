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
    context('Given the folder exists', () => {
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

      it('responds with 204 and deletes the folder and notes within', function () {
        this.retries(10)
        const folderIdToDelete = 1
        const expectedFolders = testFolders.filter(folder => folder.id !== folderIdToDelete)
        const expectedNotes = testNotes.filter(note => note.folder_id !== folderIdToDelete)
        return supertest(app)  
          .delete(`/api/folders/${folderIdToDelete}`)
          .set(auth)
          .expect(204)
          .then(res => 
            supertest(app)
              .get('/api/folders')
              .set(auth)
              .expect(200, expectedFolders)
          )
          .then(res => 
            supertest(app)
            .get('/api/notes')
            .set(auth)
            .expect(200)
            .expect(res => {
              expect(res.body.note_name).to.eql(expectedNotes.note_name)
              expect(res.body.content).to.eq(expectedNotes.content)
              expect(res.body.id).to.eq(expectedNotes.id)
              expect(res.body.folder_id).to.eql(expectedNotes.folder_id)
              const actual = res.body.map(note => note.date_modified = new Date(note.date_modified).toLocaleString())
              const expected = expectedNotes.map(note => note.date_modified = new Date(note.date_modified).toLocaleString())
              expect(actual).to.eql(expected)
            })  
          )
      });
    })
      
  })

  describe('PATCH /api/folders/:folder-id', () => {
    context('Given the folder does not exist', () => {
      it('responds 404 and an error message', () => {
        const folderID = 12345
        return supertest(app)
          .patch(`/api/folders/${folderID}`)
          .set(auth)
          .expect(404, {
            error: { message: `Folder doesn't exist`}
          })
      });
    })
    context('Given the folder exists', () => {
      const testFolders = makeFoldersArray()

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
      })

      it('responds with 204 and updates the folder', () => {
        const folderIdToUpdate = 2
        const updatedFolder = {
          folder_name: 'updated folder 2'
        }
        const expectedFolder = {
          ...testFolders[folderIdToUpdate -1],
          ...updatedFolder
        }

        return supertest(app)
          .patch(`/api/folders/${folderIdToUpdate}`)
          .set(auth)
          .send(updatedFolder)
          .expect(204)
          .then(res => 
            supertest(app)
              .get(`/api/folders`)
              .set(auth)
              .then(res => {
                const actual = res.body.filter(folder => folder.id == folderIdToUpdate)[0]
                expect(actual).to.eql(expectedFolder)
              })  
          )
      })

      it('responds with 400 when no required fields supplied ', () => {
        const folderIdToUpdate = 2
        return supertest(app)
          .patch(`/api/folders/${folderIdToUpdate}`)
          .set(auth)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: { message: `Request body content must be one of folder_name`}
          })
      })
    })
    
  })

  describe('POST /api/folders', () => {
    context('Given there are no folders', () => {
      it('should return 201 and json of the newly created folder', () => {
        const newFolder = {
          folder_name: 'new test folder'
        }
        return supertest(app)
          .post('/api/folders')
          .set(auth)
          .send(newFolder)
          .expect(201)
          .then(res => {
            expect(res.body.folder_name).to.eql(newFolder.folder_name)
            expect(res.body).to.have.property('id')
            expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
          })
      })
    })
    context('Given there are folders in the database', () => {
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

      it('if database has same folder_name responds 400 and error message', () => {
        const newTestFolder = {
          folder_name: 'Folder 1'
        }
        return supertest(app)
          .post('/api/folders')
          .set(auth)
          .send(newTestFolder)
          .expect(400, {
            error: { message: `Folder with folder name ${newTestFolder.folder_name} already exists`}
          })
      });
      it('if no required field submitted responds 400', () => {
        return supertest(app)
          .post('/api/folders')
          .set(auth)
          .expect(400, {
            error: { message: 'Folder name required'}
          })
      });
      it('returns 400 if irrelevant key sent', () => {
        return supertest(app)
          .post('/api/folders')
          .set(auth)
          .send({irrelevant: 'foo'})
          .expect(400, {
            error: { message: `Folder name required`}
          })
      });
    })  
  })
})

