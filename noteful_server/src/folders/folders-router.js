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
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { folder_name } = req.body
    const newFolder = { folder_name }
    if (!folder_name) {
      return res.status(400).json({
        error: { message: `Folder name required`}
      })
    }
    FoldersService.getAllFolders(knexInstance)
      .then(folders => {
        const filterForDuplicate = folders.filter(folder => folder.folder_name === newFolder.folder_name)
        if (filterForDuplicate.length > 0) {
          return res.status(400).json({
            error: { message: `Folder with folder name ${newFolder.folder_name} already exists`}
          })
        }
        FoldersService.insertFolder(knexInstance, newFolder)
          .then(folder => {
            logger.info(`folder created with id '${folder.id}`)
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${folder.id}`))
              .json(serializeFolder(folder))
          })
          .catch(next)
      })
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
  .patch(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { folder_id } = req.params
    const { folder_name } = req.body
    const newFolderFields = { folder_name }

    const numberOfValues = Object.values(newFolderFields).filter(Boolean).length
    FoldersService.getById(knexInstance, folder_id)
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `Folder doesn't exist`}
          })
        }
        if( numberOfValues === 0) {
          return res.status(400).json({
            error: { message: `Request body content must be one of folder_name`}
          })
        }
        FoldersService.updateFolder(
          knexInstance,
          folder_id,
          newFolderFields
        )
          .then(rowsAffected => {
            res.status(204).end()
          })
          .catch(next)
      })
  })

  module.exports = foldersRouter