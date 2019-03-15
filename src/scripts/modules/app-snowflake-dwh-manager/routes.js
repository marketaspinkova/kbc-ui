import createRoute from '../configurations/utils/createRoute';
import columnTypes from '../configurations/utils/columnTypeConstants';
import {
  createConfiguration as credentialsCreateConfiguration,
  isComplete as credentialsIsComplete,
  parseConfiguration as credentialsParseConfiguration
} from './adapters/credentials';
import ConfigurationForm from './react/components/Configuration';
import CredentialsForm from './react/components/Credentials';
import React from 'react';
import {CollapsibleSection} from '../configurations/utils/renderHelpers';
import { conform } from './adapters/conform';

import {
  createConfiguration as rowCreateConfiguration,
  parseConfiguration as rowParseConfiguration,
  createEmptyConfiguration as rowCreateEmptyConfiguration
} from './adapters/row';

const routeSettings = {
  componentId: 'keboola.app-snowflake-dwh-manager',
  componentType: 'application',
  index: {
    sections: [
      {
        render: CollapsibleSection({
          title: 'Credentials',
          contentComponent: CredentialsForm,
          options: {includeSaveButtons: true}
        }),
        onSave: credentialsCreateConfiguration,
        onLoad: credentialsParseConfiguration,
        isComplete: credentialsIsComplete
      }
    ]
  },
  row: {
    onConform: conform,
    name: {
      singular: 'Entity',
      plural: 'Entities'
    },
    sections: [
      {
        render: ConfigurationForm,
        onSave: rowCreateConfiguration,
        onLoad: rowParseConfiguration,
        onCreate: rowCreateEmptyConfiguration
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
        name: 'Entity',
        type: columnTypes.VALUE,
        value: function(row) {
          let rowEntityType = 'Unknown';
          if (row.getIn(['configuration', 'parameters', 'user'], false)) {
            rowEntityType = 'User';
          }
          if (row.getIn(['configuration', 'parameters', 'business_schema'], false)) {
            rowEntityType = 'Schema';
          }
          // let rowEntityName = 'Unknown';
          let rowEntityName = row.get('name');
          if (row.getIn(['configuration', 'parameters', 'user'], false)) {
            rowEntityName = row.getIn(['configuration', 'parameters', 'user', 'email']);
          }
          if (row.getIn(['configuration', 'parameters', 'business_schema'], false)) {
            rowEntityName = row.getIn(['configuration', 'parameters', 'business_schema', 'schema_name']);
          }
          let linkedSchemas = null;
          if (row.getIn(['configuration', 'parameters', 'user'], false)) {
            const schemas = row.getIn(['configuration', 'parameters', 'user', 'business_schemas'], []);
            if (schemas.size > 0) {
              linkedSchemas = (
                <small><br />
                  {'Granted access to: '}
                  {schemas.join(', ')}
                </small>);
            }
          }

          return <div>{rowEntityName} <small>({rowEntityType})</small> {linkedSchemas} </div>;
        }
      },
      {
        name: 'Description',
        type: columnTypes.VALUE,
        value: function(row) {
          return row.get('description') !== '' ? row.get('description') : 'No description';
        }
      }
    ]
  }
};

export default createRoute(routeSettings);
