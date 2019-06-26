const TestFixtures = {
  makeFoldersArray() {
    return [
      {
        id: 1,
        folder_name: "Folder 1"
      },
      {
        id: 2,
        folder_name: "Folder 2"
      },
      {
        id: 3,
        folder_name: "Folder 3"
      }
    ]
  },
  makeNotesArray() {
    return [
      {
        id: 1,
        note_name: "note 1",
        date_modified: "2019-01-03T00:00:00.000Z",
        folder_id: 1,
        content: "test note 1 content..."
      },
      {
        id: 2,
        note_name: "note 2",
        date_modified: "2019-02-03T00:00:00.000Z",
        folder_id: 2,
        content: "test note 2 content..."
      },
      {
        id: 3,
        note_name: "note 3",
        date_modified: "2019-03-03T00:00:00.000Z",
        folder_id: 1,
        content: "test note 3 content..."
      },
      {
        id: 4,
        note_name: "note 4",
        date_modified: "2019-04-03T00:00:00.000Z",
        folder_id: 2,
        content: "test note 4 content..."
      },
      {
        id: 5,
        note_name: "note 5",
        date_modified: "2019-05-03T00:00:00.000Z",
        folder_id: 2,
        content: "test note 5 content..."
      },
      {
        id: 6,
        note_name: "note 6",
        date_modified: "2019-06-03T00:00:00.000Z",
        folder_id: 3,
        content: "test note 6 content..."
      },
      {
        id: 7,
        note_name: "note 7",
        date_modified: "2019-07-03T00:00:00.000Z",
        folder_id: 1,
        content: "test note 7 content..."
      },
      {
        id: 8,
        note_name: "note 8",
        date_modified: "2019-08-03T00:00:00.000Z",
        folder_id: 1,
        content: "test note 8 content..."
      },
      {
        id: 9,
        note_name: "note 9",
        date_modified: "2019-09-03T00:00:00.000Z",
        folder_id: 3,
        content: "test note 9 content..."
      },
      {
        id: 10,
        note_name: "note 10",
        date_modified: "2019-10-03T00:00:00.000Z",
        folder_id: 1,
        content: "test note 10 content..."
      }
    ]
  }
}

module.exports = TestFixtures