import createRoute from '../configurations/utils/createRoute';
import columnTypes from '../configurations/utils/columnTypeConstants';
import {
  createConfiguration as rowCreateConfiguration,
  parseConfiguration as rowParseConfiguration,
  createEmptyConfiguration as rowCreateEmptyConfiguration
} from './adapters/row';
import {
  createConfiguration as credentialsCreateConfiguration,
  parseConfiguration as credentialsParseConfiguration,
  isComplete as credentialsIsComplete
} from './adapters/credentials';
import ConfigurationForm from './react/components/Configuration';
import CredentialsForm from './react/components/Credentials';
import React from 'react';
import Immutable from 'immutable';
import {CollapsibleSection} from '../configurations/utils/renderHelpers';
import conform from './adapters/conform';

const routeSettings = {
  componentId: 'keboola.ex-http',
  componentType: 'extractor',
  index: {
    sections: [
      {
        render: CollapsibleSection({
          title: 'Base URL and Connection Options',
          contentComponent: CredentialsForm,
          options: { includeSaveButtons: true }
        }),
        onSave: credentialsCreateConfiguration,
        onLoad: credentialsParseConfiguration,
        isComplete: credentialsIsComplete
      }
    ]
  },
  row: {
    onConform: conform,
    sections: [
      {
        render: ConfigurationForm,
        onSave: rowCreateConfiguration,
        onCreate: rowCreateEmptyConfiguration,
        onLoad: rowParseConfiguration
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
        name: 'Storage',
        type: columnTypes.TABLE_LINK_DEFAULT_BUCKET,
        value: function(row) {
          const processorMoveFiles = row.getIn(['configuration', 'processors', 'after'], Immutable.List()).find(
            function(processor) {
              return processor.getIn(['definition', 'component']) === 'keboola.processor-move-files';
            },
            null,
            Immutable.Map()
          );
          return processorMoveFiles.getIn(['parameters', 'folder']);
        }
      },
      {
        name: 'Description',
        type: columnTypes.VALUE,
        value: function(row) {
          return <small>{row.get('description') !== '' ? row.get('description') : 'No description'}</small>;
        }
      }
    ]
  }
};

export default createRoute(routeSettings);
