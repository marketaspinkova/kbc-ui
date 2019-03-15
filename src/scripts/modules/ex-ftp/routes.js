import createRoute from '../configurations/utils/createRoute';
import columnTypes from '../configurations/utils/columnTypeConstants';

import SourceServerSection from './react/components/SourceServer';
import SourceServerAdapter from './adapters/SourceServer';

import SourcePathSection from './react/components/SourcePath';
import SourcePathAdapter from './adapters/SourcePath';
import {CollapsibleSection} from '../configurations/utils/renderHelpers';

import Immutable from 'immutable';
import React from 'react';

import createReactClass from 'create-react-class';

const routeSettings = {
  componentId: 'keboola.ex-ftp',
  componentType: 'extractor',
  index: {
    sections: [
      {
        render: CollapsibleSection({
          title: 'Connection configuration',
          contentComponent: SourceServerSection,
          options: {includeSaveButtons: true}
        }),
        onLoad: SourceServerAdapter.parseConfiguration,
        onSave: SourceServerAdapter.createConfiguration,
        isComplete: SourceServerAdapter.isComplete
      }
    ]
  },
  row: {
    hasState: false,
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
        name: 'Storage',
        type: columnTypes.TABLE_LINK_DEFAULT_BUCKET,
        value: function(row) {
          const processorMoveFiles = row.getIn(['configuration', 'processors', 'after'], Immutable.List()).find(function(processor) {
            return processor.getIn(['definition', 'component']) === 'keboola.processor-move-files';
          }, null, Immutable.Map());
          return processorMoveFiles.getIn(['parameters', 'folder']);
        }
      },
      {
        name: 'Description',
        type: columnTypes.VALUE,
        value: function(row) {
          return (
            <small>
              {(row.get('description') !== '') ? row.get('description') : 'No description'}
            </small>
          );
        }
      }
    ]
  }
};

const result = createRoute(routeSettings);

export default result;
