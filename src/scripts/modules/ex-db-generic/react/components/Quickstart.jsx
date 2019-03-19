import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { fromJS } from 'immutable';
import { Button, Row, Col, HelpBlock } from 'react-bootstrap';
import Select from 'react-select';
import TableLoader from './TableLoaderQuickStart';

const optgroupStyles = { color: '#000', display: 'block', cursor: 'pointer' };

export default createReactClass({
  propTypes: {
    configId: PropTypes.string.isRequired,
    componentId: PropTypes.string,
    isLoadingSourceTables: PropTypes.bool.isRequired,
    isTestingConnection: PropTypes.bool.isRequired,
    validConnection: PropTypes.bool.isRequired,
    sourceTables: PropTypes.object,
    sourceTablesError: PropTypes.string,
    quickstart: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    refreshMethod: PropTypes.func.isRequired
  },

  shouldComponentUpdate(nextProps) {
    const updateOnProps = [
      'isLoadingSourceTables',
      'isTestingConnection',
      'validConnection',
      'sourceTables',
      'sourceTablesError',
      'quickstart'
    ];
    return updateOnProps.reduce((acc, prop) => acc || nextProps[prop] !== this.props[prop], false);
  },

  quickstart() {
    this.props.onSubmit(this.props.configId, this.props.quickstart.get('tables'));
  },

  handleSelectChange(selected) {
    return this.props.onChange(this.props.configId, fromJS(selected.map((table) => table.value)));
  },

  getTableOptions() {
    if (!this.props.sourceTables || !this.props.sourceTables.count()) {
      return [];
    }

    const groupedTables = this.props.sourceTables.groupBy((table) => table.get('schema'));
    return groupedTables.keySeq().map((group) => {
      return {
        value: group,
        label: group,
        children: groupedTables
          .get(group)
          .map((table) => {
            return {
              value: {
                schema: table.get('schema'),
                tableName: table.get('name')
              },
              label: table.get('schema') + '.' + table.get('name')
            };
          })
          .toJS()
      };
    });
  },

  getQuickstartValue(tables) {
    if (!tables) {
      return [];
    }

    return tables.toJS().map((table) => ({
      label: table.schema + '.' + table.tableName,
      value: table
    }));
  },

  render() {
    var tableSelector = (
      <div>
        <Row className="text-left">
          <Col md={8} mdOffset={2}>
            <HelpBlock>
              Select the tables you&apos;d like to import to autogenerate your configuration. <br />
              You can edit them later at any time.
            </HelpBlock>
          </Col>
        </Row>
        <Row className="text-left">
          <Col md={8} mdOffset={2}>
            <Select
              multi
              value={this.getQuickstartValue(this.props.quickstart.get('tables'))}
              placeholder="Select tables to copy"
              onChange={this.handleSelectChange}
              optionRenderer={this.optionRenderer}
              options={this.transformOptions(this.getTableOptions())}
            />
          </Col>
          <Col md={2}>
            <Button
              bsStyle="success"
              onClick={this.quickstart}
              disabled={
                !this.props.quickstart.get('tables') ||
                this.props.quickstart.get('tables').count() === 0
              }
            >
              Create
            </Button>
          </Col>
        </Row>
      </div>
    );

    return (
      <div className="text-center">
        <TableLoader
          componentId={this.props.componentId}
          configId={this.props.configId}
          isLoadingSourceTables={this.props.isLoadingSourceTables}
          isTestingConnection={this.props.isTestingConnection}
          validConnection={this.props.validConnection}
          tableSelectorElement={tableSelector}
          refreshMethod={this.props.refreshMethod}
        />
      </div>
    );
  },

  transformOptions(options) {
    const option = (value, label, render, disabled = false) => ({ value, label, render, disabled });

    return options.reduce((acc, o) => {
      const parent = option(
        o.value,
        o.label,
        <strong
          style={optgroupStyles}
          title={`Select all tables in ${o.label} schema.`}
          onClick={(event) => {
            event.preventDefault();
            this.selectAllFromScheme(o.children);
          }}
        >
          Schema: {o.label}
        </strong>,
        true
      );
      const children = o.children.map((c) => option(c.value, c.label, <div>{c.label}</div>));

      return acc.concat(parent).concat(children);
    }, []);
  },

  optionRenderer(option) {
    return option.render;
  },

  selectAllFromScheme(schemaTables) {
    const selected = this.getQuickstartValue(this.props.quickstart.get('tables'));
    schemaTables.forEach((option) => {
      if (!selected.find((item) => item.label === option.label)) {
        selected.push(option);
      }
    });
    this.props.onChange(this.props.configId, fromJS(selected.map((table) => table.value)));
  }
});
