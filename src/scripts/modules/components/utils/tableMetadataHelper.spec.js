import {
  hasTableColumnMetadataDatatypes,
  getColumnMetadataByProvider,
  getMachineColumnMetadata,
  getUserColumnMetadata
} from './tableMetadataHelper';
import { Map, fromJS } from 'immutable';

const table = fromJS({
  columnMetadata: {
    country: [
      {
        key: 'KBC.datatype.basetype',
        value: 'STRING',
        provider: 'keboola.ex-db-snowflake',
        timestamp: '2018-12-12T08:17:37+0100'
      }
    ]
  }
});

let userMetadata = {
  key: 'KBC.description',
  value: 'popis',
  provider: 'user',
  timestamp: '2019-02-02T08:00:00+0100'
};

describe('tableMetadataHelper', function() {
  describe('hasTableColumnMetadataDatatypes', function() {
    it('return true if table has any valid column metadata (any column has defined KBC.datatype.basetype)', function() {
      expect(true).toEqual(hasTableColumnMetadataDatatypes(table));
    });

    it('return false if table has no valid column metadata (no column has defined KBC.datatype.basetype', function() {
      const tableWithoutValidMetadata = table.set('columnMetadata', fromJS({ column: [userMetadata] }));
      expect(false).toEqual(hasTableColumnMetadataDatatypes(tableWithoutValidMetadata));
    });
  });

  describe('getColumnMetadataByProvider', function() {
    it('return empty Map when table has no column metadata field', function() {
      const tableWithoutMetadata = table.set('columnMetadata', Map());
      expect(Map()).toEqual(getColumnMetadataByProvider(tableWithoutMetadata, 'keboola.ex-db-snowflake'));
    });

    it('return filtered metadata by provider', function() {
      expect(fromJS({ country: [] })).toEqual(getColumnMetadataByProvider(table, 'user'));
    });

    it('return filtered metadata by provider', function() {
      expect(table.get('columnMetadata')).toEqual(getColumnMetadataByProvider(table, 'keboola.ex-db-snowflake'));
    });
  });

  describe('getMachineColumnMetadata', function() {
    it('return empty Map when table has no metadata written by other provider than user', function() {
      const tableWithOnlyUserMetdata = table.set('columnMetadata', fromJS({
        country: [userMetadata]
      }));
      expect(Map()).toEqual(getMachineColumnMetadata(tableWithOnlyUserMetdata));
    });

    it('return filtered column metadata by last active provider other than user', function() {
      const tableWithAnotherOlderMetadata = table.updateIn(['columnMetadata', 'country'], (metadata) => {
        return metadata.push(fromJS({
          key: 'KBC.datatype.basetype',
          value: 'STRING',
          provider: 'other',
          timestamp: '2017-12-12T08:17:37+0100'
        }));
      });
      expect(table.get('columnMetadata')).toEqual(getMachineColumnMetadata(tableWithAnotherOlderMetadata));
    });
  });

  describe('getUserColumnMetadata', function() {
    it('return only column metadata created by user', function() {
      expect(fromJS({ country: [] })).toEqual(getUserColumnMetadata(table));
    });

    it('return only column metadata created by user', function() {
      const tableWithMachineAndUserMetadata = table.updateIn(['columnMetadata', 'country'], (metadata) => {
        return metadata.push(fromJS(userMetadata));
      });
      expect(fromJS({ country: [userMetadata] })).toEqual(getUserColumnMetadata(tableWithMachineAndUserMetadata));
    });
  });
});
