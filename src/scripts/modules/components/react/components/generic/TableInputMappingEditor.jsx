import React from 'react';
import { Map, List } from 'immutable';
import { PanelWithDetails } from '@keboola/indigo-ui';
import { HelpBlock } from 'react-bootstrap';
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

  _handleChangeSource(value) {
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

  _handleChangeDestination(e) {
    const value = this.props.value.set('destination', e.target.value.trim());
    return this.props.onChange(value);
  },

  _getFileName() {
    if (this.props.value.get('destination') && this.props.value.get('destination') !== '') {
      return this.props.value.get('destination');
    }

    if (this.props.value.get('source') && this.props.value.get('source') !== '') {
      return this.props.value.get('source');
    }

    return '';
  },

  render() {
    return (
      <div className="form-horizontal clearfix">
        <div className="row col-md-12">
          <div className="form-group">
            <label className="col-xs-2 control-label">Source</label>
            <div className="col-xs-10">
              <SapiTableSelector
                value={this.props.value.get('source')}
                disabled={this.props.disabled}
                placeholder="Source table"
                onSelectTableFn={this._handleChangeSource}
                autoFocus={true}
              />
            </div>
          </div>
        </div>
        {!this.props.definition.has('destination') && (
          <div className="row col-md-12">
            <Input
              type="text"
              label="File name"
              value={this.props.value.get('destination')}
              disabled={this.props.disabled}
              placeholder="File name"
              onChange={this._handleChangeDestination}
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
                        <code>{`/data/in/tables/${this._getFileName()}`}</code>
                      </span>
                    )}
                  </HelpBlock>
                )
              }
            />
          </div>
        )}
        <div className="row col-md-12">
          <PanelWithDetails defaultExpanded={this.props.initialShowDetails}>
            <div className="form-horizontal clearfix">
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
            </div>
          </PanelWithDetails>
        </div>
      </div>
    );
  }
});
