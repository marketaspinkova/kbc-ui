import React from 'react';


import createRoute  from '../configurations/utils/createRoute';
import columnTypes  from '../configurations/utils/columnTypeConstants';
import {CollapsibleSection} from '../configurations/utils/renderHelpers';

import SourceTableSection from './react/components/SourceTable';
import sourceTableAdapter from './adapters/sourceTable';

import SaveSettingsSection from './react/components/SaveSettings';
import saveSettingsAdapter from './adapters/saveSettings';

import SourceProjectSection from './react/components/SourceProject';
import sourceProjectAdapter from './adapters/sourceProject';

const routeSettings = {
  componentId: 'keboola.ex-storage',
  componentType: 'extractor',
  index: {
    sections: [
      {
        render: CollapsibleSection({
          title: 'Source Project',
          contentComponent: SourceProjectSection,
          options: { includeSaveButtons: true }
        }),
        onSave: sourceProjectAdapter.createConfiguration,
        onLoad: sourceProjectAdapter.parseConfiguration,
        isComplete: sourceProjectAdapter.isComplete
      }
    ]
  },
  row: {
    hasState: false,
    sections: [
      {
        render: SourceTableSection,
        onSave: sourceTableAdapter.createConfiguration,
        onLoad: sourceTableAdapter.parseConfiguration,
        onCreate: sourceTableAdapter.createEmptyConfiguration
      },
      {
        render: SaveSettingsSection,
        onSave: saveSettingsAdapter.createConfiguration,
        onLoad: saveSettingsAdapter.parseConfiguration,
        onCreate: saveSettingsAdapter.createEmptyConfiguration
      }

    ],
    columns: [
      {
        name: 'Source',
        type: columnTypes.VALUE,
        value: function(row) {
          return row.getIn(['configuration', 'parameters', 'tableName'], 'Unknown');
        }
      },
      {
        name: 'Destination',
        type: columnTypes.TABLE_LINK_DEFAULT_BUCKET,
        value: function(row) {
          return row.getIn(['configuration', 'parameters', 'tableName']);
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
