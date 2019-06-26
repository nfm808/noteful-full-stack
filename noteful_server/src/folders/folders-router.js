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

  module.exports = foldersRouter