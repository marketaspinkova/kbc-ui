import { createDocumentationTree, buildDocumentationToMarkdown } from './DocumentationUtils';
import { fromJS, List } from 'immutable';

function makeDescription(description) {
  return [
    {
      key: 'KBC.description',
      value: description
    }
  ];
}

const buckets = fromJS([
  {
    id: 'bucket1',
    metadata: makeDescription('bucket1 description')
  },
  {
    id: 'bucket2',
    metadata: makeDescription('bucket1 description')
  },
  {
    id: 'emptybucket',
    metadata: makeDescription('emptybucket description')
  },
  {
    id: 'emptybucketnodescription'
  }
]);

const tables = fromJS([
  {
    id: 'bucket1.table11',
    name: 'table11',
    bucket: {
      id: 'bucket1'
    },
    metadata: makeDescription('table11 description'),
    columns: ['columnA', 'columnB', 'columnC'],
    columnMetadata: {
      columnA: makeDescription('columnA description'),
      columnC: makeDescription('columnC description')
    }
  },
  {
    id: 'bucket1.table12',
    bucket: {
      id: 'bucket1'
    },
    name: 'table12',
    metadata: makeDescription('table12 description'),
    columns: ['columnA', 'columnB', 'columnC'],
    columnMetadata: {}
  },
  {
    id: 'bucket2.table21',
    name: 'table21',
    bucket: {
      id: 'bucket2'
    },
    metadata: makeDescription('table21 description'),
    columns: ['columnA'],
    columnMetadata: {
      columnA: makeDescription('columnA description')
    }
  },
  {
    id: 'bucket2.table22',
    name: 'table22',
    bucket: {
      id: 'bucket2'
    },
    columns: ['column22A'],
    columnMetadata: {
      column22A: makeDescription('column22A description')
    }
  },
  {
    id: 'bucket2.table23',
    name: 'table23',
    bucket: {
      id: 'bucket2'
    },
    metadata: [],
    columns: ['column23A', 'column23B'],
    columnMetadata: {
      column23A: makeDescription('column23A description')
    }
  }
]);

const expectedDocumentationTree = [
  {
    id: 'bucket1',
    metadata: [
      {
        key: 'KBC.description',
        value: 'bucket1 description'
      }
    ],
    bucketTables: [
      {
        id: 'bucket1.table11',
        name: 'table11',
        bucket: {
          id: 'bucket1'
        },
        metadata: [
          {
            key: 'KBC.description',
            value: 'table11 description'
          }
        ],
        columns: ['columnA', 'columnB', 'columnC'],
        columnMetadata: {
          columnA: [
            {
              key: 'KBC.description',
              value: 'columnA description'
            }
          ],
          columnC: [
            {
              key: 'KBC.description',
              value: 'columnC description'
            }
          ]
        },
        tableDescription: 'table11 description',
        columnsDescriptions: {
          columnA: 'columnA description',
          columnC: 'columnC description'
        }
      },
      {
        id: 'bucket1.table12',
        bucket: {
          id: 'bucket1'
        },
        name: 'table12',
        columnMetadata: {},
        metadata: [
          {
            key: 'KBC.description',
            value: 'table12 description'
          }
        ],
        columns: ['columnA', 'columnB', 'columnC'],
        tableDescription: 'table12 description',
        columnsDescriptions: {}
      }
    ],
    bucketDescription: 'bucket1 description'
  },
  {
    id: 'bucket2',
    metadata: [
      {
        key: 'KBC.description',
        value: 'bucket1 description'
      }
    ],
    bucketTables: [
      {
        id: 'bucket2.table21',
        name: 'table21',
        bucket: {
          id: 'bucket2'
        },
        metadata: [
          {
            key: 'KBC.description',
            value: 'table21 description'
          }
        ],
        columns: ['columnA'],
        columnMetadata: {
          columnA: [
            {
              key: 'KBC.description',
              value: 'columnA description'
            }
          ]
        },
        tableDescription: 'table21 description',
        columnsDescriptions: {
          columnA: 'columnA description'
        }
      },
      {
        id: 'bucket2.table22',
        name: 'table22',
        bucket: {
          id: 'bucket2'
        },
        columns: ['column22A'],
        columnMetadata: {
          column22A: [
            {
              key: 'KBC.description',
              value: 'column22A description'
            }
          ]
        },
        tableDescription: null,
        columnsDescriptions: {
          column22A: 'column22A description'
        }
      },
      {
        id: 'bucket2.table23',
        name: 'table23',
        bucket: {
          id: 'bucket2'
        },
        metadata: [],
        columns: ['column23A', 'column23B'],
        columnMetadata: {
          column23A: [
            {
              key: 'KBC.description',
              value: 'column23A description'
            }
          ]
        },
        columnsDescriptions: {
          column23A: 'column23A description'
        }
      }
    ],
    bucketDescription: 'bucket1 description'
  },
  {
    id: 'emptybucket',
    metadata: [
      {
        key: 'KBC.description',
        value: 'emptybucket description'
      }
    ],
    bucketTables: [],
    bucketDescription: 'emptybucket description'
  },
  {
    id: 'emptybucketnodescription',
    bucketTables: [],
    bucketDescription: null
  }
];

describe('DecumentationUtils', function() {
  describe('createDocumentationTree', function() {
    it('should create empty docuemntation tree', function() {
      const documentationTree = createDocumentationTree(List(), List(), '');
      expect(documentationTree.toJS()).toEqual([]);
    });
    it('should create documentationTree', function() {
      const documentationTree = createDocumentationTree(buckets, tables, '');
      expect(documentationTree.toJS()).toEqual(expectedDocumentationTree);
    });

    it('should create documentationTree filtered to table', function() {
      const filteredDocumentationTree = createDocumentationTree(buckets, tables, 'table1');
      const expectedFilteredTree = [
        {
          id: 'bucket1',
          metadata: [
            {
              key: 'KBC.description',
              value: 'bucket1 description'
            }
          ],
          bucketTables: [
            {
              id: 'bucket1.table11',
              name: 'table11',
              bucket: {
                id: 'bucket1'
              },
              metadata: [
                {
                  key: 'KBC.description',
                  value: 'table11 description'
                }
              ],
              columns: ['columnA', 'columnB', 'columnC'],
              columnMetadata: {
                columnA: [
                  {
                    key: 'KBC.description',
                    value: 'columnA description'
                  }
                ],
                columnC: [
                  {
                    key: 'KBC.description',
                    value: 'columnC description'
                  }
                ]
              },
              tableDescription: 'table11 description',
              columnsDescriptions: {}
            },
            {
              id: 'bucket1.table12',
              bucket: {
                id: 'bucket1'
              },
              name: 'table12',
              metadata: [
                {
                  key: 'KBC.description',
                  value: 'table12 description'
                }
              ],
              columns: ['columnA', 'columnB', 'columnC'],
              columnMetadata: {},
              tableDescription: 'table12 description',
              columnsDescriptions: {}
            }
          ],
          bucketDescription: 'bucket1 description'
        }
      ];
      expect(filteredDocumentationTree.toJS()).toEqual(expectedFilteredTree);
    });
    it('should filter emptybucket', function() {
      const filteredDocumentationTree = createDocumentationTree(buckets, tables, 'emptybucket');
      const expectedFilteredTree = [
        {
          id: 'emptybucket',
          metadata: [
            {
              key: 'KBC.description',
              value: 'emptybucket description'
            }
          ],
          bucketTables: [],
          bucketDescription: 'emptybucket description'
        },
        {
          id: 'emptybucketnodescription',
          bucketTables: [],
          bucketDescription: null
        }
      ];
      expect(filteredDocumentationTree.toJS()).toEqual(expectedFilteredTree);
    });

    it('should filter to column', function() {
      const filteredDocumentationTree = createDocumentationTree(buckets, tables, 'column23A');
      const expectedFilteredTree = [
        {
          id: 'bucket2',
          metadata: [
            {
              key: 'KBC.description',
              value: 'bucket1 description'
            }
          ],
          bucketTables: [
            {
              id: 'bucket2.table23',
              name: 'table23',
              bucket: {
                id: 'bucket2'
              },
              metadata: [],
              columns: ['column23A', 'column23B'],
              columnMetadata: {
                column23A: [
                  {
                    key: 'KBC.description',
                    value: 'column23A description'
                  }
                ]
              },
              columnsDescriptions: {
                column23A: 'column23A description'
              }
            }
          ],
          bucketDescription: 'bucket1 description'
        }
      ];
      expect(filteredDocumentationTree.toJS()).toEqual(expectedFilteredTree);
    });
  });
  describe('buildDocumentationToMarkdown', function() {
    const createdDocumentationTree = createDocumentationTree(buckets, tables, '');
    it('should create empty markdown', function() {
      const createdMarkdownArray = buildDocumentationToMarkdown(
        createdDocumentationTree,
        '123',
        'myproject'
      ).filter((markdownString) => !markdownString.startsWith('created'));
      const createdMarkdownString = createdMarkdownArray.join('');
      const expectedMarkdownString = `# Documentation of myproject(123) project
      ## Bucket bucket1
      bucket1 description
      ### Table bucket1.table11
      table11 description
      #### Column columnA
      columnA description
      #### Column columnB
      N/A
      #### Column columnC
      columnC description
      ### Table bucket1.table12
      table12 description
      #### Column columnA
      N/A
      #### Column columnB
      N/A
      #### Column columnC
      N/A
      ## Bucket bucket2
      bucket1 description
      ### Table bucket2.table21
      table21 description
      #### Column columnA
      columnA description
      ### Table bucket2.table22
      N/A
      #### Column column22A
      column22A description
      ### Table bucket2.table23
      N/A
      #### Column column23A
      column23A description
      #### Column column23B
      N/A
      ## Bucket emptybucket
      emptybucket description
      ## Bucket emptybucketnodescription
      N/A
      `;
      expect(createdMarkdownString.split('\n').map((s) => s.trim())).toEqual(
        expectedMarkdownString.split('\n').map((s) => s.trim())
      );
    });
  });
});
