import createRoute  from '../configurations/utils/createRoute';
import columnTypes  from '../configurations/utils/columnTypeConstants';
import createColumnsEditorSection from '../configurations/utils/createColumnsEditorSection';
import {CollapsibleSection} from '../configurations/utils/renderHelpers';

import TargetTableSection from './react/components/TargetTableSection';
import targetTable from './adapters/targetTable';

import LoadTypeSection from './react/components/LoadTypeSection';
import LoadTypeSectionTitle from './react/components/LoadTypeSectionTitle';
import loadType from './adapters/loadType';

import columnsEditorDefinition from './helpers/columnsEditorDefinition';

import React from 'react';

const routeSettings = {
  componentId: 'keboola.wr-google-bigquery',
  componentType: 'writer',
  index: {
    sections: []
  },
  row: {
    parseTableId: (row) => row.getIn(['storage', 'input', 'tables', 0, 'source']),
    hasState: false,
    sections: [
      {
        render: TargetTableSection,
        onSave: targetTable.createConfiguration,
        onLoad: targetTable.parseConfiguration,
        onCreate: targetTable.createEmptyConfiguration,
        isComplete: () => true
      },
      {
        render: CollapsibleSection({
          title: LoadTypeSectionTitle,
          contentComponent: LoadTypeSection
        }),
        onSave: loadType.createConfiguration,
        onLoad: loadType.parseConfiguration,
        onCreate: loadType.createEmptyConfiguration,
        isComplete: () => true
      },
      createColumnsEditorSection(columnsEditorDefinition)
    ],
    columns: [
      {
        name: 'Name',
        type: columnTypes.VALUE,
        value: function(row) {
          return row.getIn('name') !== '' ? row.get('name') : 'Untitled';
        }
      },
      {
        name: 'BigQuery Name',
        type: columnTypes.VALUE,
        value: function(row) {
          return row.getIn(['configuration', 'parameters', 'tables', 0, 'dbName'], 'Unknown');
        }
      },
      {
        name: 'Description',
        type: columnTypes.VALUE,
        value: function(row) {
          return (
            <small>
              {row.get('description') !== '' ? row.get('description') : 'No description'}
            </small>
          );
        }
      }
    ]
  }
};

const result = createRoute(routeSettings);

export default result;
