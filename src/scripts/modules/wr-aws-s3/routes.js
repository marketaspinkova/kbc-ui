import createRoute from '../configurations/utils/createRoute';
import columnTypes from '../configurations/utils/columnTypeConstants';
import {
  createConfiguration as rowCreateConfiguration,
  parseConfiguration as rowParseConfiguration,
  createEmptyConfiguration as rowCreateEmptyConfiguration
} from './adapters/configuration';
import {
  createConfiguration as credentialsCreateConfiguration,
  parseConfiguration as credentialsParseConfiguration,
  isComplete as credentialsIsComplete
} from './adapters/credentials';
import ConfigurationForm from './react/components/Configuration';
import CredentialsForm from './react/components/Credentials';
import React from 'react';
import {CollapsibleSection} from '../configurations/utils/renderHelpers';
import Immutable from 'immutable';

const routeSettings = {
  componentId: 'keboola.wr-aws-s3',
  componentType: 'writer',
  index: {
    sections: [{
      render: CollapsibleSection({
        title: 'AWS Credentials',
        contentComponent: CredentialsForm,
        options: {includeSaveButtons: true}
      }),
      onSave: credentialsCreateConfiguration,
      onLoad: credentialsParseConfiguration,
      isComplete: credentialsIsComplete
    }]
  },
  row: {
    sections: [{
      render: ConfigurationForm,
      onSave: rowCreateConfiguration,
      onCreate: rowCreateEmptyConfiguration,
      onLoad: rowParseConfiguration
    }],
    columns: [
      {
        name: 'Name',
        type: columnTypes.VALUE,
        value: function(row) {
          return row.get('name') !== '' ? row.get('name') : 'Untitled';
        }
      },
      {
        name: 'Source Table',
        type: columnTypes.TABLE_LINK,
        value: function(row) {
          const configuration = row.getIn(['configuration'], Immutable.Map());
          return configuration.getIn(['storage', 'input', 'tables', 0, 'source'], 'Unknown');
        }
      },
      {
        name: 'Destination ',
        type: columnTypes.VALUE,
        value: function(row) {
          const configuration = row.getIn(['configuration'], Immutable.Map());
          return configuration.getIn(['storage', 'input', 'tables', 0, 'destination'], 'Unknown');
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

export default createRoute(routeSettings);
