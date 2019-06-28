const path = require('path')
const express = require('express')
const logger = require('../logger')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
  id: note.id,
  note_name: xss(note.note_name),
  date_modified: note.date_modified,
  folder_id: note.folder_id,
  content: xss(note.content),
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    NotesService.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes.map(note => serializeNote(note)))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { note_name, date_modified, folder_id, content} = req.body
    const newNote = { note_name, folder_id, content}
    
    for(const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body`}
        })
      }
    }
    NotesService.getAllNotes(knexInstance)
      .then(notes => {
        const checkForDuplicates = notes.filter(note => note.note_name === newNote.note_name)
        if (checkForDuplicates.length > 0) {
          return res.status(400).json({
            error: { message: `Note name must be unique`}
          })
        }
        NotesService.insertNote(knexInstance, newNote)
          .then(note => {
            logger.info(`note created with id '${note.id}'`)
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${note.id}`))
              .json(serializeNote(note))
          })
          .catch(next)
      })

  })

  module.exports = notesRouter