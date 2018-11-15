
import createRoute from '../configurations/utils/createRoute';
import columnTypes  from '../configurations/utils/columnTypeConstants';

import SourceServerSection from './react/components/SourceServer';
import SourceServerAdapter from './adapters/SourceServer';

import SourcePathSection from './react/components/SourcePath';
import SourcePathAdapter from './adapters/SourcePath';
import {CollapsibleSection} from '../configurations/utils/renderHelpers';

const routeSettings = {
  componentId: 'keboola.ex-ftp',
  componentType: 'extractor',
  index: {
    sections: [
      {
        render: CollapsibleSection({
          title: 'Connection configuration',
          contentComponent: SourceServerSection,
          options: { includeSaveButtons: true }
        }),
        onLoad: SourceServerAdapter.parseConfiguration,
        onSave: SourceServerAdapter.createConfiguration,
        isComplete: SourceServerAdapter.isComplete
      }
    ]
  },
  row: {
    hasState: false,
    name: {
      singular: 'path',
      plural: 'path'
    },
    sections: [
      {
        render: SourcePathSection,
        onSave: SourcePathAdapter.createConfiguration,
        onLoad: SourcePathAdapter.parseConfiguration,
        onCreate: SourcePathAdapter.createEmptyConfiguration
      }
    ],
    columns: [
      {
        name: 'Name',
        type: columnTypes.VALUE,
        value: function(row) {
          return row.get('name') !== '' ? row.get('name') : 'Untitled';
        }
      },
      {
        name: 'Path',
        type: columnTypes.VALUE,
        value: function(row) {
          return row.getIn(['configuration', 'parameters', 'path']);
        }
      },
      {
        name: 'Only new files',
        type: columnTypes.VALUE,
        value: function(row) {
          return row.getIn(['configuration', 'parameters', 'onlyNewFiles']) ? 'Yes' : 'No';
        }
      }
    ]
  }
};

const result = createRoute(routeSettings);

export default result;
