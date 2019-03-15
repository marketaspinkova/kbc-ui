import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import Immutable from 'immutable';
import { Form, FormGroup, FormControl, ControlLabel, Col, HelpBlock } from 'react-bootstrap';
import Select from '../../../../../react/common/Select';
import SapiTableSelector from '../../../../components/react/components/SapiTableSelector';
import ChangedSinceInput from '../../../../../react/common/ChangedSinceInput';
import { PanelWithDetails } from '@keboola/indigo-ui';
import whereOperatorConstants from '../../../../../react/common/whereOperatorConstants';

export default createReactClass({
  propTypes: {
    value: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    initialShowDetails: PropTypes.bool.isRequired,
    isDestinationDuplicate: PropTypes.bool.isRequired,
    definition: PropTypes.object
  },

  getDefaultProps() {
    return { definition: Immutable.Map() };
  },

  _handleChangeSource(value) {
    // use only table name from the table identifier
    let destination;
    if (value) {
      destination = value.substr(value.lastIndexOf('.') + 1) + '.csv';
    } else {
      destination = '';
    }
    if (this.props.definition.has('destination')) {
      destination = this.props.definition.get('destination');
    }
    const immutable = this.props.value.withMutations(mapping =>
      mapping
        .set('source', value)
        .set('destination', destination)
        .set('whereColumn', '')
        .set('whereValues', Immutable.List())
        .set('whereOperator', 'eq')
        .set('columns', Immutable.List())
    );
    return this.props.onChange(immutable);
  },

  _handleChangeDestination(e) {
    const value = this.props.value.set('destination', e.target.value.trim());
    return this.props.onChange(value);
  },

  _handleChangeChangedSince(changedSince) {
    let { value } = this.props;
    if (this.props.value.has('days')) {
      value = value.delete('days');
    }
    value = value.set('changedSince', changedSince);
    return this.props.onChange(value);
  },

  _handleChangeColumns(newValue) {
    const immutable = this.props.value.withMutations(mapping => {
      mapping.set('columns', newValue);
      if (!_.contains(mapping.get('columns').toJS(), mapping.get('whereColumn'))) {
        mapping
          .set('whereColumn', '')
          .set('whereValues', Immutable.List())
          .set('whereOperator', 'eq');
      }
    });
    return this.props.onChange(immutable);
  },

  _handleChangeWhereColumn(string) {
    const value = this.props.value.set('whereColumn', string);
    return this.props.onChange(value);
  },

  _handleChangeWhereOperator(e) {
    const value = this.props.value.set('whereOperator', e.target.value);
    return this.props.onChange(value);
  },

  _handleChangeWhereValues(newValue) {
    const value = this.props.value.set('whereValues', newValue);
    return this.props.onChange(value);
  },

  _getColumns() {
    if (!this.props.value.get('source')) {
      return [];
    }
    const table = this.props.tables.find(t => t.get('id') === this.props.value.get('source'));
    if (!table) {
      return [];
    }
    return table.get('columns', Immutable.List()).toJS();
  },

  _getColumnsOptions() {
    const columns = this._getColumns();
    return _.map(columns, column => ({
      label: column,
      value: column
    }));
  },

  _getFilteredColumnsOptions() {
    let columns;
    if (this.props.value.get('columns').count()) {
      columns = this.props.value.get('columns').toJS();
    } else {
      columns = this._getColumns();
    }
    return _.map(columns, column => ({
      label: column,
      value: column
    }));
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
      <Form horizontal>
        <FormGroup>
          <Col sm={2} componentClass={ControlLabel}>Source</Col>
          <Col sm={10}>
            <SapiTableSelector
              value={this.props.value.get('source', '')}
              disabled={this.props.disabled}
              placeholder="Source table"
              onSelectTableFn={this._handleChangeSource}
              autoFocus={true}
            />
          </Col>
        </FormGroup>
        {!this.props.definition.has('destination') && (
          <FormGroup>
            <Col sm={2} componentClass={ControlLabel}>File name</Col>
            <Col sm={10}>
              <FormControl
                type="text"
                value={this.props.value.get('destination')}
                disabled={this.props.disabled}
                placeholder="File name"
                onChange={this._handleChangeDestination}
                bsStyle={this.props.isDestinationDuplicate ? 'error' : null}
              />
              {this.props.isDestinationDuplicate ? (
                <HelpBlock>
                  {'Duplicate destination '}
                  <code>{this.props.value.get('destination')}</code>.
                </HelpBlock>
              ) : (
                <HelpBlock>
                  File will be available at
                  <code>{`/data/in/tables/${this._getFileName()}`}</code>
                </HelpBlock>
              )}
            </Col>
          </FormGroup>
        )}
        <PanelWithDetails defaultExpanded={this.props.initialShowDetails}>
          <FormGroup>
            <Col sm={2} componentClass={ControlLabel}>Columns</Col>
            <Col sm={10}>
              <Select
                multi={true}
                name="columns"
                value={this.props.value.get('columns', Immutable.List()).toJS()}
                disabled={this.props.disabled || !this.props.value.get('source')}
                placeholder="All columns will be imported"
                onChange={this._handleChangeColumns}
                options={this._getColumnsOptions()}
              />
              <HelpBlock>Import only specified columns</HelpBlock>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col sm={2} componentClass={ControlLabel}>Changed in last</Col>
            <Col sm={10}>
              <ChangedSinceInput
                value={this.props.value.get(
                  'changedSince',
                  this.props.value.get('days') > 0 ? `-${this.props.value.get('days')} days` : null
                )}
                disabled={this.props.disabled || !this.props.value.get('source')}
                onChange={this._handleChangeChangedSince}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col sm={2} componentClass={ControlLabel}>Data filter</Col>
            <Col sm={4}>
              <Select
                name="whereColumn"
                value={this.props.value.get('whereColumn')}
                disabled={this.props.disabled || !this.props.value.get('source')}
                placeholder="Select column"
                onChange={this._handleChangeWhereColumn}
                options={this._getColumnsOptions()}
              />
            </Col>
            <Col sm={2}>
              <FormControl
                componentClass="select"
                name="whereOperator"
                value={this.props.value.get('whereOperator')}
                disabled={this.props.disabled}
                onChange={this._handleChangeWhereOperator}
              >
                <option value={whereOperatorConstants.EQ_VALUE}>{whereOperatorConstants.EQ_LABEL}</option>
                <option value={whereOperatorConstants.NOT_EQ_VALUE}>{whereOperatorConstants.NOT_EQ_LABEL}</option>
              </FormControl>
            </Col>
            <Col sm={4}>
              <Select
                name="whereValues"
                value={this.props.value.get('whereValues')}
                multi={true}
                disabled={this.props.disabled}
                allowCreate={true}
                delimiter=","
                placeholder="Add a value..."
                emptyStrings={true}
                onChange={this._handleChangeWhereValues}
              />
            </Col>
          </FormGroup>
        </PanelWithDetails>
      </Form>
    );
  }
});
