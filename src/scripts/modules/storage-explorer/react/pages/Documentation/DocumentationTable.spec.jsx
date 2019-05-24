import React from 'react';
import DocumentationTable from './DocumentationTable';
import { fromJS, Map } from 'immutable';

const documentationTree = fromJS([
  {
    id: 'bucket1',
    bucketDescription: 'this is bucket1 description',
    bucketTables: [
      {
        name: 'table1',
        id: 'bucket1.table1',
        tableDescription: 'this is table1 description',
        columnsDescriptions: {
          column1: 'this is column1 description',
          column2: null,
          column3: 'column3 description blabla ###heading blabla'
        }
      },
      {
        name: 'table2',
        id: 'bucket1.table2',
        tableDescription: null,
        columnsDescriptions: {
          column1: null,
          column2: null,
          column3: null
        }
      }
    ]
  },
  {
    id: 'emptyBucketNoDescription',
    bucketDescription: null,
    bucketTables: []
  },
  {
    id: 'emptyBucket',
    bucketDescription: 'this is emptyBucket description',
    bucketTables: []
  }
]);

const emptyDocumentationTree = fromJS([]);

describe('<DocumentationTable />', function() {
  it('should render empty documentation tree', function() {
    shallowSnapshot(
      <DocumentationTable
        documentationTree={emptyDocumentationTree}
        isSearchQuery={false}
        openedRows={Map()}
        toggleDocumentationRow={() => null}
      />
    );
  });

  it('should render buckets only documentation tree', function() {
    shallowSnapshot(
      <DocumentationTable
        documentationTree={documentationTree}
        isSearchQuery={false}
        openedRows={Map()}
        toggleDocumentationRow={() => null}
      />
    );
  });

  it('should render whole documentation tree', function() {
    shallowSnapshot(
      <DocumentationTable
        documentationTree={documentationTree}
        isSearchQuery={true}
        openedRows={Map()}
        toggleDocumentationRow={() => null}
      />
    );
  });

  it('should render toggled bucket documentation tree', function() {
    shallowSnapshot(
      <DocumentationTable
        documentationTree={documentationTree}
        isSearchQuery={false}
        openedRows={fromJS({
          BUCKET_ROWbucket1: true
        })}
        toggleDocumentationRow={() => null}
      />
    );
  });

  it('should render toggled bucket and table documentation tree', function() {
    shallowSnapshot(
      <DocumentationTable
        documentationTree={documentationTree}
        isSearchQuery={false}
        openedRows={fromJS({
          BUCKET_ROWbucket1: true,
          'TABLE_ROWbucket1.table1': true
        })}
        toggleDocumentationRow={() => null}
      />
    );
  });

  it('should render whole tree if has toggled bucket and table', function() {
    shallowSnapshot(
      <DocumentationTable
        documentationTree={documentationTree}
        isSearchQuery={true}
        openedRows={fromJS({
          BUCKET_ROWbucket1: true,
          TABLE_ROWtable1: true
        })}
        toggleDocumentationRow={() => null}
      />
    );
  });
});
