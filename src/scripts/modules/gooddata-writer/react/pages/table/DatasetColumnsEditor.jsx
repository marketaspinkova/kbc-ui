import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Immutable from 'immutable';
import { Table } from 'react-bootstrap';

import Row from './DatasetColumnEditorRow';
import Hint from '../../../../../react/common/Hint';
import pureRendererMixin from 'react-immutable-render-mixin';

export default createReactClass({
  mixins: [pureRendererMixin],
  propTypes: {
    columns: PropTypes.object.isRequired,
    invalidColumns: PropTypes.object.isRequired,
    referenceableTables: PropTypes.object.isRequired,
    columnsReferences: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onColumnChange: PropTypes.func.isRequired,
    configurationId: PropTypes.string.isRequired,
    dataPreview: PropTypes.object,
    showIdentifier: PropTypes.bool.isRequired,
    isExported: PropTypes.bool.isRequired
  },

  _handleColumnChange(column) {
    return this.props.onColumnChange(column);
  },

  render() {
    return (
      <Table striped responsive className="kbc-table-editor">
        <thead>
          <tr>
            <th>Column</th>
            <th>GoodData title</th>
            <th>Type</th>
            <th>Reference</th>
            <th>Sort Label</th>
            <th />
            <th>Data Type</th>
            {this.props.showIdentifier && (
              <th>
                Identifier{' '}
                <Hint title="Identifier">
                  {'Identifier of column in GoodData. '}
                  {'This can be useful when you are migrating project from CloudConnect. '}
                  If left empty the defaults will be used.
                  {
                    ' Allowed characters: lowercase and uppercase letters, numbers, underscore "_" and dot "."'
                  }
                </Hint>
              </th>
            )}
            {this.props.showIdentifier && <th>Identifier Label</th>}
            <th />
          </tr>
        </thead>
        <tbody>
          {this.props.columns
            .map(currentColumn => {
              const colName = currentColumn.get('name');
              return (
                <Row
                  column={currentColumn}
                  referenceableTables={this.props.referenceableTables}
                  referenceableColumns={this.props.columnsReferences.getIn(
                    [colName, 'referenceableColumns'],
                    Immutable.Map()
                  )}
                  sortLabelColumns={this.props.columnsReferences.getIn(
                    [colName, 'sortColumns'],
                    Immutable.Map()
                  )}
                  isEditing={this.props.isEditing}
                  isSaving={this.props.isSaving}
                  isValid={!this.props.invalidColumns.contains(colName)}
                  configurationId={this.props.configurationId}
                  key={currentColumn.get('name')}
                  onChange={this._handleColumnChange}
                  dataPreview={this.props.dataPreview}
                  showIdentifier={this.props.showIdentifier}
                  isExported={this.props.isExported}
                />
              );
            })
            .toArray()}
        </tbody>
      </Table>
    );
  }
});
