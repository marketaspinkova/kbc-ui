import matchByWords from '../../utils/matchByWords';
import { List, Map } from 'immutable';



const BUCKET_ROW = 'BUCKET_ROW';
const TABLE_ROW = 'TABLE_ROW';
const COLUMN_ROW = 'COLUMN_ROW';

function createMarkdownPart(memo, nodeType, node) {
  switch (nodeType) {
    case BUCKET_ROW:
      memo.push(`## Bucket ${node.get('id')} \n ${node.get('bucketDescription') || 'N/A'}\n`);
      break;
    case TABLE_ROW:
      memo.push(`### Table ${node.get('id')} \n ${node.get('tableDescription') || 'N/A'}\n`);
      break;
    case COLUMN_ROW:
      memo.push(`#### Column ${node.get('column')} \n ${node.get('description') || 'N/A'}\n`);
      break;
  }
  return memo;
}

// DFS walk the tree and call reduceNodeFn for each node
function reduceDocumentationTree(documentationTree, reduceNodeFn, initValue) {
  return documentationTree.reduce((bucketsMemo, bucket) => {
    const reducedBucketMemo = reduceNodeFn(bucketsMemo, BUCKET_ROW, bucket, null);
    return bucket.get('bucketTables').reduce((tablesMemo, table) => {
      const reducedTablesMemo = reduceNodeFn(tablesMemo, TABLE_ROW, table, bucket);
      return table.get('columnsDescriptions').reduce((columnsMemo, description, column) => {
        const columnObject = Map({column, description});
        return reduceNodeFn(columnsMemo, COLUMN_ROW, columnObject, table);
      }, reducedTablesMemo);
    }, reducedBucketMemo);
  }, initValue);
}

function buildDocumentationToMarkdown(documentationTree) {
  return reduceDocumentationTree(documentationTree, createMarkdownPart, []);
}

function matchDescriptionOrName(description, name, searchQuery) {
  if (searchQuery) {
    return matchByWords(name, searchQuery) || matchByWords(description || '', searchQuery);
  } else {
    return true;
  }
}

function getDescription(metadata) {
  if (metadata) {
    const description = metadata.find((entry) => entry.get('key') === 'KBC.description');
    return description && description.get('value');
  } else {
    return null;
  }
}
function createDocumentationTree(buckets, tables, searchQuery) {
  return buckets.map((bucket) => {
    const bucketId = bucket.get('id');
    const bucketTables = tables
      .filter((table) => table.getIn(['bucket', 'id']) === bucketId)
      .map((table) => {
        const columnsDescriptions = table
          .get('columns')
          .reduce(
            (memo, column) =>
              memo.set(
                column,
                getDescription(table.getIn(['columnMetadata', column], List()))
              ),
            Map()
          ).filter((columnDescription, columnName) =>
            matchDescriptionOrName(columnDescription, columnName, searchQuery)
          );
        const tableDescription = getDescription(table.get('metadata'));
        return table
          .set('tableDescription', tableDescription)
          .set('columnsDescriptions', columnsDescriptions);
      })
      .filter(table => {
        if (searchQuery) {
          return matchDescriptionOrName(table.get('tableDescription'), table.get('name'), searchQuery) || table.get('columnsDescriptions').count() > 0;
        } else {
          return true;
        }
      });
    const description = getDescription(bucket.get('metadata'));
    return bucket
      .set('bucketTables', bucketTables)
      .set('bucketDescription', description);
  }).filter(bucket => {
    if (searchQuery) {
      return matchDescriptionOrName(bucket.get('bucketDescription'), bucket.get('id'), searchQuery) || bucket.get('bucketTables').count() > 0;
    } else {
      return true;
    }

  });
}

const rowTypes = {BUCKET_ROW, TABLE_ROW, COLUMN_ROW};
export {
  createDocumentationTree,
  buildDocumentationToMarkdown,
  reduceDocumentationTree,
  rowTypes
};
