const FoldersService = {
  getAllFolders(knex) {
    return knex.select('*').from('noteful_folders')
  },
  getById(knex, id) {
    return knex
      .from('noteful_folders')
      .select('*')
      .where('id', id)
      .first()
  },
  deleteFolder(knex, id) {
    return knex
      .from('noteful_folders')
      .where({ id })
      .delete()
  },
  updateFolder(knex, id, newFolderFields) {
    return knex
      .from('noteful_folders')
      .where({ id })
      .update(newFolderFields)
  }
}

module.exports = FoldersService