import matchByWords from '../../utils/matchByWords';
import { List, Map } from 'immutable';

const BUCKET_ROW = 'BUCKET_ROW';
const TABLE_ROW = 'TABLE_ROW';
const COLUMN_ROW = 'COLUMN_ROW';

function createMarkdownPart(resultMarkdownArray, nodeType, node) {
  switch (nodeType) {
    case BUCKET_ROW:
      resultMarkdownArray.push(
        `## Bucket ${node.get('id')} \n ${node.get('bucketDescription') || 'N/A'}\n`
      );
      break;
    case TABLE_ROW:
      resultMarkdownArray.push(
        `### Table ${node.get('id')} \n ${node.get('tableDescription') || 'N/A'}\n`
      );
      break;
    case COLUMN_ROW:
      resultMarkdownArray.push(
        `#### Column ${node.get('column')} \n ${node.get('description') || 'N/A'}\n`
      );
      break;
  }
  return resultMarkdownArray;
}

// DFS walk the tree(bucketA->tableA->column, bucketA->tableB->column) and call reduceNodeFn for each node
function reduceDocumentationTree(documentationTree, reduceNodeFn, initValue) {
  return documentationTree.reduce((bucketsMemo, bucket) => {
    const reducedBucketMemo = reduceNodeFn(bucketsMemo, BUCKET_ROW, bucket, null);
    return bucket.get('bucketTables').reduce((tablesMemo, table) => {
      const reducedTablesMemo = reduceNodeFn(tablesMemo, TABLE_ROW, table, bucket);
      return table.get('columnsDescriptions').reduce((columnsMemo, description, column) => {
        const columnObject = Map({ column, description });
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

function getColumnsDescriptionsMap(table) {
  return table
    .get('columns')
    .reduce(
      (memo, column) =>
        memo.set(column, getDescription(table.getIn(['columnMetadata', column], List()))),
      Map()
    );
}

function matchBySearchQuery(searchQuery, nodeDescription, nodeName, filteredChildrenList) {
  if (searchQuery) {
    return (
      matchDescriptionOrName(nodeDescription, nodeName, searchQuery) ||
      filteredChildrenList.count() > 0
    );
  } else {
    return true;
  }
}

function createDocumentationTree(buckets, tables, searchQuery) {
  return buckets
    .map((bucket) => {
      const bucketId = bucket.get('id');
      const bucketDescription = getDescription(bucket.get('metadata'));
      const bucketTables = tables
        .filter((table) => table.getIn(['bucket', 'id']) === bucketId)
        .map((table) => {
          const tableDescription = getDescription(table.get('metadata'));
          const columnsDescriptions = getColumnsDescriptionsMap(table).filter(
            (columnDescription, columnName) =>
              matchBySearchQuery(searchQuery, columnDescription, columnName, List())
          );
          return table
            .set('tableDescription', tableDescription)
            .set('columnsDescriptions', columnsDescriptions);
        })
        .filter((table) =>
          matchBySearchQuery(
            searchQuery,
            table.get('tableDescription'),
            table.get('name'),
            table.get('columnsDescriptions')
          )
        );
      return bucket.set('bucketTables', bucketTables).set('bucketDescription', bucketDescription);
    })
    .filter((bucket) =>
      matchBySearchQuery(
        searchQuery,
        bucket.get('bucketDescription'),
        bucket.get('id'),
        bucket.get('bucketTables')
      )
    );
}

const rowTypes = { BUCKET_ROW, TABLE_ROW, COLUMN_ROW };
export { createDocumentationTree, buildDocumentationToMarkdown, reduceDocumentationTree, rowTypes };
