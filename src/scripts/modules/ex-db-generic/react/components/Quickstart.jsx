import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

import Immutable from 'immutable';
import Select from 'react-select';
import TableLoader from './TableLoaderQuickStart';

export default createReactClass({
  displayName: 'Quickstart',
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
    const updateOnProps = ['isLoadingSourceTables', 'isTestingConnection', 'validConnection', 'sourceTables', 'sourceTablesError', 'quickstart'];
    return updateOnProps.reduce((acc, prop) => acc || nextProps[prop] !== this.props[prop], false);
  },

  quickstart() {
    this.props.onSubmit(this.props.configId, this.props.quickstart.get('tables'));
  },

  handleSelectChange(selected) {
    return this.props.onChange(this.props.configId, Immutable.fromJS(selected.map(function(table) {
      return table.value;
    })));
  },

  getTableOptions() {
    if (this.props.sourceTables && this.props.sourceTables.count() > 0) {
      const groupedTables = this.props.sourceTables.groupBy(table => table.get('schema'));
      return groupedTables.keySeq().map(function(group) {
        return {
          value: group,
          label: group,
          children: groupedTables.get(group).map(function(table) {
            return {
              value: {
                schema: table.get('schema'),
                tableName: table.get('name')
              },
              label: table.get('schema') + '.' + table.get('name')
            };
          }).toJS()
        };
      });
    } else {
      return [];
    }
  },

  getQuickstartValue(tables) {
    if (tables) {
      let jsTables = tables;
      if (tables.toJS) {
        jsTables = tables.toJS();
      }
      return jsTables.map(function(table) {
        return {
          label: table.schema + '.' + table.tableName,
          value: table
        };
      });
    } else {
      return [];
    }
  },

  render() {
    var tableSelector = (
      <div>
        <div className="row text-left">
          <div className="col-md-8 col-md-offset-2 help-block">
          Select the tables you&apos;d like to import to autogenerate your configuration. <br/>
          You can edit them later at any time.
          </div>
        </div>
        <div className="row text-left">
          <div className="col-md-8 col-md-offset-2">
            <Select
              multi={true}
              matchProp="label"
              name="quickstart"
              value={this.getQuickstartValue(this.props.quickstart.get('tables'))}
              placeholder="Select tables to copy"
              onChange={this.handleSelectChange}
              filterOptions={this.filterOptions}
              optionRenderer={this.optionRenderer}
              options={this.transformOptions(this.getTableOptions())}/>
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-success"
              onClick={this.quickstart}
              disabled={!this.props.quickstart.get('tables') || this.props.quickstart.get('tables').count() === 0}
            > Create
            </button>
          </div>
        </div>
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
    var filterOption = function(op) {
      if (values && Immutable.fromJS(values).toMap().find(
        function(item) {
          return item.get('label') === op.label;
        }, op)
      ) {
        return false;
      }
      var labelTest = String(op.label).toLowerCase();
      var filterStr = filterString.toLowerCase();
      return !filterStr || labelTest.indexOf(filterStr) >= 0;
    };
    return (options || []).filter(filterOption, this);
  },

  transformOptions(options) {
    const option = (value, label, render, disabled = false) => ({value, label, render, disabled});

    return options.reduce((acc, o) => {
      const parent = option(o.value, o.label, (<strong style={{color: '#000'}}>Schema: {o.label}</strong>), true);
      const children = o.children.map(c => option(c.value, c.label, <div>{c.label}</div>));

      return acc.concat(parent).concat(children);
    }, []);
  },

  optionRenderer(option) {
    return option.render;
  }

});
