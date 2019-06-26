const TestFixtures = {
  makeFoldersArray() {
    return [
      {
        id: 1,
        name: "Folder 1"
      },
      {
        id: 2,
        name: "Folder 2"
      },
      {
        id: 3,
        name: "Folder 3"
      }
    ]
  },
  makeNotesArray() {
    return [
      {
        id: 1,
        name: "note 1",
        modified: "2019-01-03T00:00:00.000Z",
        folderId: 1,
        content: "test note 1 content..."
      },
      {
        id: 2,
        name: "note 2",
        modified: "2019-02-03T00:00:00.000Z",
        folderId: 2,
        content: "test note 2 content..."
      },
      {
        id: 3,
        name: "note 3",
        modified: "2019-03-03T00:00:00.000Z",
        folderId: 1,
        content: "test note 3 content..."
      },
      {
        id: 4,
        name: "note 4",
        modified: "2019-04-03T00:00:00.000Z",
        folderId: 2,
        content: "test note 4 content..."
      },
      {
        id: 5,
        name: "note 5",
        modified: "2019-05-03T00:00:00.000Z",
        folderId: 2,
        content: "test note 5 content..."
      },
      {
        id: 6,
        name: "note 6",
        modified: "2019-06-03T00:00:00.000Z",
        folderId: 3,
        content: "test note 6 content..."
      },
      {
        id: 7,
        name: "note 7",
        modified: "2019-07-03T00:00:00.000Z",
        folderId: 1,
        content: "test note 7 content..."
      },
      {
        id: 8,
        name: "note 8",
        modified: "2019-08-03T00:00:00.000Z",
        folderId: 1,
        content: "test note 8 content..."
      },
      {
        id: 9,
        name: "note 9",
        modified: "2019-09-03T00:00:00.000Z",
        folderId: 3,
        content: "test note 9 content..."
      },
      {
        id: 10,
        name: "note 10",
        modified: "2019-10-03T00:00:00.000Z",
        folderId: 1,
        content: "test note 10 content..."
      }
    ]
  }
}

module.exports = TestFixtures