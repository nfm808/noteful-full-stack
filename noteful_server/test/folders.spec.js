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
              .get(`/api/bookmarks/`)
              .set(auth)
              .expect(expectedFolder)  
          )
      });
    })
    
  })
  
  
})

