import React from 'react';
import { Map, List } from 'immutable';
import { PanelWithDetails } from '@keboola/indigo-ui';
import { Alert, HelpBlock } from 'react-bootstrap';
import { Input } from '../../../../../react/common/KbcBootstrap';
import SapiTableSelector from '../SapiTableSelector';
import ChangedSinceFilterInput from './ChangedSinceFilterInput';
import DataFilterRow from './DataFilterRow';
import ColumnsSelectRow from './ColumnsSelectRow';

export default React.createClass({
  propTypes: {
    value: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    initialShowDetails: React.PropTypes.bool.isRequired,
    showFileHint: React.PropTypes.bool,
    isDestinationDuplicate: React.PropTypes.bool.isRequired,
    definition: React.PropTypes.object
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
        <div className="form-group">
          <label className="col-xs-2 control-label">Source</label>
          <div className="col-xs-10">
            <SapiTableSelector
              value={this.props.value.get('source')}
              disabled={this.props.disabled}
              placeholder="Source table"
              onSelectTableFn={this.handleChangeSource}
              autoFocus={true}
            />
          </div>
        </div>
        {!this.props.definition.has('destination') && (
          <Input
            type="text"
            label="File name"
            value={this.props.value.get('destination')}
            disabled={this.props.disabled}
            placeholder="File name"
            onChange={this.handleChangeDestination}
            labelClassName="col-xs-2"
            wrapperClassName="col-xs-10"
            bsStyle={this.props.isDestinationDuplicate ? 'error' : null}
            help={
              this.props.isDestinationDuplicate ? (
                <small className="error">
                  {'Duplicate destination '}
                  <code>{this.props.value.get('destination')}</code>.
                </small>
              ) : (
                <HelpBlock>
                  {this.props.showFileHint && (
                    <span>
                        File will be available at
                      <code>{`/data/in/tables/${this.getFileName()}`}</code>
                    </span>
                  )}
                </HelpBlock>
              )
            }
          />
        )}
        {!this.props.value.get('source') || this.existSelectedSourceTable() ? (
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
            />
            <DataFilterRow
              value={this.props.value}
              disabled={this.props.disabled}
              onChange={this.props.onChange}
              allTables={this.props.tables}
            />
          </PanelWithDetails>
        ) : (
          <Alert bsStyle="warning">
            Source table does not exist.
          </Alert>
        )}
      </div>
    );
  },

  existSelectedSourceTable() {
    return this.props.tables.get(this.props.value.get('source'), Map()).count() > 0;
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
