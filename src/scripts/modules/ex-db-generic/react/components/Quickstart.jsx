import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import { Button, Row, Col, HelpBlock } from 'react-bootstrap';
import Select from 'react-select';
import TableLoader from './TableLoaderQuickStart';

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
    const selectedTables = selected.reduce((options, item) => {
      // if type of value is string, all tables from schema will be added
      if (typeof item.value === 'string') {
        this.props.sourceTables.groupBy((table) => table.get('schema'))
          .get(item.value)
          .forEach((table) => {
            options = options.set(`${table.get('schema')}.${table.get('name')}`, Map({
              schema: table.get('schema'),
              tableName: table.get('name')
            }))
          });
        return options;
      }
      return options.set(`${item.value.schema}.${item.value.tableName}`, Map(item.value));
    }, Map());

    this.props.onChange(this.props.configId, selectedTables.toList());
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
              Selecting a schema will add all tables from the schema.
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
              filterOptions={this.filterOptions}
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

  filterOptions(options, filterString, values) {
    const filterStr = filterString.toLowerCase();

    return options
      .filter((option) => {
        if (values.find((item) => item.label === option.label)) {
          return false;
        }
        return !filterStr || option.label.toLowerCase().indexOf(filterStr) >= 0;
      });
  },

  transformOptions(options) {
    const option = (value, label, render) => ({ value, label, render });

    return options.reduce((acc, o) => {
      const parent = option(
        o.value,
        o.label,
        <strong>Schema: {o.label}</strong>
      );
      const children = o.children.map((c) => option(c.value, c.label, <div>{c.label}</div>));
      return acc.concat(parent).concat(children);
    }, []);
  },

  optionRenderer(option) {
    return option.render;
  }
});
