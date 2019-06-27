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
  }
}

module.exports = FoldersService