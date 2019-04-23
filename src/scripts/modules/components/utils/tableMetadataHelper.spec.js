import {
  hasTableColumnMetadataDatatypes,
  getTableLastUpdatedInfo,
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
  },
  metadata: [
    {
      key: 'KBC.createdBy.component.id',
      value: 'keboola.ex-db-snowflake',
      provider: 'system',
      timestamp: '2018-12-12T08:17:37+0100'
    },
    {
      key: 'KBC.createdBy.configuration.id',
      value: '469551086',
      provider: 'system',
      timestamp: '2018-12-12T08:17:37+0100'
    },
    {
      key: 'KBC.lastUpdatedBy.component.id',
      value: 'keboola.ex-db-snowflake',
      provider: 'system',
      timestamp: '2018-12-12T08:19:05+0100'
    },
    {
      key: 'KBC.lastUpdatedBy.configuration.id',
      value: '469551086',
      provider: 'system',
      timestamp: '2018-12-12T08:19:05+0100'
    }
  ]
});

describe('tableMetadataHelper', function() {
  describe('getTableLastUpdatedInfo', function() {
    it('should return valid object if table has KBC.lastUpdatedBy.component.id and KBC.lastUpdatedBy.configuration.id metadata', function() {
      expect({
        component: 'keboola.ex-db-snowflake',
        config: '469551086',
        timestamp: '2018-12-12T08:19:05+0100'
      }).toEqual(getTableLastUpdatedInfo(table));
    });

    it('should return valid object if table has KBC.createdBy.component.id and KBC.createdBy.configuration.id metadata', function() {
      expect({
        component: 'keboola.ex-db-snowflake',
        config: '469551086',
        timestamp: '2018-12-12T08:17:37+0100'
      }).toEqual(getTableLastUpdatedInfo(table.deleteIn(['metadata', 3])));
    });

    it('should return null if table has no KBC.lastUpdatedBy.component.id and KBC.lastUpdatedBy.configuration.id or KBC.createdBy.component.id and KBC.createdBy.configuration.id metadata', function() {
      expect(null).toEqual(
        getTableLastUpdatedInfo(table.deleteIn(['metadata', 1]).deleteIn(['metadata', 2]))
      );
    });
  });

  describe('hasTableColumnMetadataDatatypes', function() {
    it('return true if table has any valid column metadata (any column has defined KBC.datatype.basetype)', function() {
      expect(true).toEqual(hasTableColumnMetadataDatatypes(table));
    });

    it('return false if table has no valid column metadata (no column has defined KBC.datatype.basetype', function() {
      expect(false).toEqual(
        hasTableColumnMetadataDatatypes(table.deleteIn(['columnMetadata', 'country']))
      );
    });
  });

  describe('getColumnMetadataByProvider', function() {
    it('return empty Map when table has no column metadata field', function() {
      expect(Map()).toEqual(
        getColumnMetadataByProvider(table.delete('columnMetadata'), 'keboola.ex-db-snowflake')
      );
    });

    it('return filtered metadata by provider', function() {
      expect(
        fromJS({
          country: []
        })
      ).toEqual(getColumnMetadataByProvider(table, 'user'));
    });

    it('return filtered metadata by provider', function() {
      expect(
        fromJS({
          country: [
            {
              key: 'KBC.datatype.basetype',
              value: 'STRING',
              provider: 'keboola.ex-db-snowflake',
              timestamp: '2018-12-12T08:17:37+0100'
            }
          ]
        })
      ).toEqual(getColumnMetadataByProvider(table, 'keboola.ex-db-snowflake'));
    });
  });

  describe('getMachineColumnMetadata', function() {
    it('return empty Map when table has no valid metadata - KBC.lastUpdatedBy.* or KBC.createdBy.*', function() {
      expect(Map()).toEqual(getMachineColumnMetadata(table.delete('metadata')));
    });

    it('return filtered column metadata by component - has KBC.lastUpdatedBy.* or KBC.createdBy.*', function() {
      expect(table.get('columnMetadata')).toEqual(getMachineColumnMetadata(table));
    });
  });

  describe('getUserColumnMetadata', function() {
    it('return only column metadata created by user', function() {
      expect(fromJS({ country: [] })).toEqual(getUserColumnMetadata(table));
    });

    it('return only column metadata created by user', function() {
      const userMetadata = {
        key: 'KBC.description',
        value: 'popis',
        provider: 'user',
        timestamp: '2019-02-02T08:00:00+0100'
      };

      expect(fromJS({ country: [userMetadata] })).toEqual(
        getUserColumnMetadata(
          table.updateIn(['columnMetadata', 'country'], (metadata) => {
            return metadata.push(fromJS(userMetadata));
          })
        )
      );
    });
  });
});
