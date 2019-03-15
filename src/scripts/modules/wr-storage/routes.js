import { Map } from 'immutable';
import React from 'react';


import createRoute from '../configurations/utils/createRoute';
import columnTypes from '../configurations/utils/columnTypeConstants';
import { CollapsibleSection } from '../configurations/utils/renderHelpers';

import InputMappingSection from './react/components/InputMapping';
import inputMappingAdapter from './adapters/inputMapping';

import TargetProjectSection from './react/components/TargetProject';
import targetProjectAdapter from './adapters/targetProject';

import DestinationSection from './react/components/Destination';
import destinationAdapter from './adapters/destination';

import actions from './adapters/actions';
import { conform } from './adapters/conform';

const routeSettings = {
  componentId: 'keboola.wr-storage',
  componentType: 'writer',
  index: {
    actions: [
      {
        name: 'info',
        cache: true,
        autoload: true,
        getPayload: actions.info
      }
    ],
    sections: [
      {
        render: CollapsibleSection({
          title: 'Target Project',
          contentComponent: TargetProjectSection,
          options: { includeSaveButtons: true }
        }),
        onSave: targetProjectAdapter.createConfiguration,
        onLoad: targetProjectAdapter.parseConfiguration,
        isComplete: targetProjectAdapter.isComplete
      }
    ]
  },
  row: {
    onConform: conform,
    hasState: false,
    sections: [
      {
        render: InputMappingSection,
        onSave: inputMappingAdapter.createConfiguration,
        onLoad: inputMappingAdapter.parseConfiguration,
        onCreate: inputMappingAdapter.createEmptyConfiguration
      },
      {
        render: DestinationSection,
        onSave: destinationAdapter.createConfiguration,
        onLoad: destinationAdapter.parseConfiguration,
        onCreate: destinationAdapter.createEmptyConfiguration
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
        name: 'Source Table',
        type: columnTypes.TABLE_LINK,
        value: function(row) {
          const configuration = row.getIn(['configuration'], Map());
          return configuration.getIn(['storage', 'input', 'tables', 0, 'source'], 'Unknown');
        }
      },
      {
        name: 'Destination Table',
        type: columnTypes.VALUE,
        value: function(row) {
          const configuration = row.getIn(['configuration'], Map());
          return configuration.getIn(['storage', 'input', 'tables', 0, 'destination'], 'Unknown');
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

const result = createRoute(routeSettings);

export default result;
