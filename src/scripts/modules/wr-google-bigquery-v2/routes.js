import createRoute  from '../configurations/utils/createRoute';
import columnTypes  from '../configurations/utils/columnTypeConstants';
import createColumnsEditorSection from '../configurations/utils/createColumnsEditorSection';
import {CollapsibleSection} from '../configurations/utils/renderHelpers';

import TargetTableSection from './react/components/TargetTableSection';
import targetTable from './adapters/targetTable';

import TargetDatasetSection from './react/components/TargetDatasetSection';
import targetDataset from './adapters/targetDataset';

import LoadTypeSection from './react/components/LoadTypeSection';
import loadType from './adapters/loadType';

import ServiceAccountSection from './react/components/ServiceAccountSection';
import serviceAccount from './adapters/serviceAccount';

import columnsEditorDefinition from './helpers/columnsEditorDefinition';

const routeSettings = {
  componentId: 'keboola.wr-google-bigquery-v2',
  componentType: 'writer',
  index: {
    sections: [
      {
        render: CollapsibleSection({
          title: 'Google Service Account Key',
          contentComponent: ServiceAccountSection,
          options: { includeSaveButtons: true }
        }),
        onSave: serviceAccount.createConfiguration,
        onLoad: serviceAccount.parseConfiguration,
        isComplete: serviceAccount.isComplete
      },
      {
        render: CollapsibleSection({
          title: 'Google BigQuery Dataset',
          contentComponent: TargetDatasetSection,
          options: { includeSaveButtons: true }
        }),
        onSave: targetDataset.createConfiguration,
        onLoad: targetDataset.parseConfiguration,
        isComplete: targetDataset.isComplete
      }
    ]
  },
  row: {
    parseTableId: (row) => row.getIn(['storage', 'input', 'tables', 0, 'source']),
    hasState: false,
    sections: [
      {
        render: TargetTableSection,
        onSave: targetTable.createConfiguration,
        onLoad: targetTable.parseConfiguration,
        onCreate: targetTable.createEmptyConfiguration
      },
      {
        render: LoadTypeSection,
        onSave: loadType.createConfiguration,
        onLoad: loadType.parseConfiguration,
        onCreate: loadType.createEmptyConfiguration
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
        name: 'Source Table',
        type: columnTypes.TABLE_LINK,
        value: function(row) {
          const configuration = row.get('configuration');
          return configuration.getIn(['storage', 'input', 'tables', 0, 'source'], 'Unknown');
        }
      },
      {
        name: 'BigQuery Table',
        type: columnTypes.VALUE,
        value: function(row) {
          return row.getIn(['configuration', 'parameters', 'tables', 0, 'dbName'], 'Unknown');
        }
      }
    ]
  }
};

const result = createRoute(routeSettings);

export default result;
