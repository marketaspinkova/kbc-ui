import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map, List } from 'immutable';
import { PanelWithDetails } from '@keboola/indigo-ui';
import { Alert, Col, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import SapiTableSelector from '../SapiTableSelector';
import ChangedSinceFilterInput from './ChangedSinceFilterInput';
import DataFilterRow from './DataFilterRow';
import ColumnsSelectRow from './ColumnsSelectRow';

export default createReactClass({
  propTypes: {
    value: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    editingNonExistentTable: PropTypes.bool.isRequired,
    initialShowDetails: PropTypes.bool.isRequired,
    showFileHint: PropTypes.bool,
    isDestinationDuplicate: PropTypes.bool.isRequired,
    componentType: PropTypes.string.isRequired,
    definition: PropTypes.object
  },

  getDefaultProps() {
    return {
      showFileHint: true,
      definition: Map()
    };
  },

  render() {
    return (
      <div className="form-horizontal">
        {this.props.editingNonExistentTable && (
          <Alert bsStyle="warning">
            Source table does not exist.
          </Alert>
        )}
        <div className="form-group">
          <label className="col-xs-2 control-label">Source</label>
          <div className="col-xs-10">
            <SapiTableSelector
              value={this.props.value.get('source', '')}
              disabled={this.props.disabled}
              placeholder="Source table"
              onSelectTableFn={this.handleChangeSource}
              autoFocus={true}
            />
          </div>
        </div>
        {!this.props.definition.has('destination') && (
          <FormGroup>
            <Col xs={2} componentClass={ControlLabel}>
              File name
            </Col>
            <Col xs={10}>
              <FormControl
                type="text"
                value={this.props.value.get('destination', '')}
                disabled={this.props.disabled}
                placeholder="File name"
                onChange={this.handleChangeDestination}
              />
              {this.props.isDestinationDuplicate && (
                <HelpBlock className="error">
                  Duplicate destination <code>{this.props.value.get('destination')}</code>.
                </HelpBlock>
              )}
              {!this.props.isDestinationDuplicate && this.props.showFileHint && (
                <HelpBlock>
                  File will be available at <code>{`/data/in/tables/${this.getFileName()}`}</code>
                </HelpBlock>
              )}
            </Col>
          </FormGroup>
        )}
        <PanelWithDetails defaultExpanded={this.props.initialShowDetails}>
          <ColumnsSelectRow
            value={this.props.value}
            disabled={this.props.disabled}
            onChange={this.props.onChange}
            allTables={this.props.tables}
          />
          <ChangedSinceFilterInput
            mapping={this.props.value}
            disabled={this.props.disabled}
            onChange={this.props.onChange}
            tableId={this.props.value.get('source', '')}
          />
          <DataFilterRow
            value={this.props.value}
            disabled={this.props.disabled}
            onChange={this.props.onChange}
            allTables={this.props.tables}
          />
        </PanelWithDetails>
      </div>
    );
  },

  handleChangeSource(value) {
    // use only table name from the table identifier
    const immutable = this.props.value.withMutations(mapping => {
      let destination;
      mapping.set('source', value);
      if (value) {
        destination = value.substr(value.lastIndexOf('.') + 1) + '.csv';
      } else {
        destination = '';
      }
      mapping.set('destination', destination);
      mapping.set('where_column', '');
      mapping.set('where_values', List());
      mapping.set('where_operator', 'eq');
      mapping.set('columns', List());
    });

    return this.props.onChange(immutable);
  },

  handleChangeDestination(e) {
    const value = this.props.value.set('destination', e.target.value.trim());
    return this.props.onChange(value);
  },

  getFileName() {
    if (this.props.value.get('destination') && this.props.value.get('destination') !== '') {
      return this.props.value.get('destination');
    }

    if (this.props.value.get('source') && this.props.value.get('source') !== '') {
      return this.props.value.get('source');
    }

    return '';
  }
});
