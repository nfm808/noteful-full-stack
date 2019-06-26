const path = require('path')
const express = require('express')
const logger = require('../logger')
const xss = require('xss')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
  id: folder.id,
  folder_name: xss(folder.folder_name),
})

foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    FoldersService.getAllFolders(knexInstance)
      .then(folders => {
        logger.info(folders)
        res.json(folders.map(folder => serializeFolder(folder)))
      })
      .catch(next)
  })

foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    FoldersService.getById(
      req.app.get('db'),
      req.params.folder_id
    )
    .then(folder => {
      if (!folder) {
        logger.error(`Invalid article request with id: ${req.params.folder_id}`)
        return res.status(404).json({
          error: { message: `Folder doesn't exist`}
        })
      }
      res.folder = folder
      next()
    })
    .catch(next)
  })
  .delete((req, res, next) => {
    FoldersService.deleteFolder(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

  module.exports = foldersRouter