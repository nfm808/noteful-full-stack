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
        res.json(folders.map(folder => serializeFolder(folder)))
      })
      .catch(next)
  })

foldersRouter
  .route('/:folder_id')
  .delete((req, res, next) => {
    const { folder_id } = req.params
    const knexInstance = req.app.get('db')
    
    FoldersService.getById(knexInstance, folder_id )
      .then(folder => {
        if (!folder) {
          logger.error(`Invalid folder DELETE request with id: ${folder_id}`)
          return res
            .status(404).json({
              error: { message: `Folder doesn't exist`}
            })
        }
        FoldersService.deleteFolder(knexInstance, folder.id)
          .then(() => {
            res.status(204).end()
          })
          .catch(next)
      })
  })

  module.exports = foldersRouter