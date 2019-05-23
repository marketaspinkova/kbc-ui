import matchByWords from '../../utils/matchByWords';
import { List, Map } from 'immutable';



const BUCKET_ROW = 'BUCKET_ROW';
const TABLE_ROW = 'TABLE_ROW';
const COLUMN_ROW = 'COLUMN_ROW';

function createMarkdownPart(name, partDescription, partType) {
  const description = partDescription || 'N/A';
  switch (partType) {
    case BUCKET_ROW:
      return `## ${name} \n ${description}\n`;
    case TABLE_ROW:
      return `### ${name} \n ${description}\n`;
    case COLUMN_ROW:
      return `#### ${name} \n ${description}\n`;
  }

}

function buildDocumentationToMarkdown(documentationTree) {
  return documentationTree.reduce((bucketsMemo, bucket) => {
    const bucketId = bucket.get('id');
    bucketsMemo.push(
      createMarkdownPart(`Bucket ${bucketId}`, bucket.get('bucketDescription'), BUCKET_ROW)
    );
    const bucketTablesRows = bucket.get('bucketTables').reduce((tablesMemo, table) => {
      const tableId = table.get('id');
      tablesMemo.push(
        createMarkdownPart(`Table ${tableId}`, table.get('tableDescription'), TABLE_ROW)
      );
      const columnsRows = table.get('columnsDescriptions').reduce((columnsMemo, description, column) => {
        columnsMemo.push(createMarkdownPart(`Column ${column}`, description, COLUMN_ROW));
        return columnsMemo;
      }, []);
      return tablesMemo.concat(columnsRows);
    }, []);
    return bucketsMemo.concat(bucketTablesRows);
  }, []);
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
  rowTypes
};
