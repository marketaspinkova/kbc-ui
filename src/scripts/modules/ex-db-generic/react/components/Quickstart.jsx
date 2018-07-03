import React from 'react';

import Immutable from 'immutable';
import Select from 'react-select';
import TableLoader from './TableLoaderQuickStart';

export default React.createClass({
  displayName: 'Quickstart',
  propTypes: {
    configId: React.PropTypes.string.isRequired,
    componentId: React.PropTypes.string,
    isLoadingSourceTables: React.PropTypes.bool.isRequired,
    isTestingConnection: React.PropTypes.bool.isRequired,
    validConnection: React.PropTypes.bool.isRequired,
    sourceTables: React.PropTypes.object,
    sourceTablesError: React.PropTypes.string,
    quickstart: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    refreshMethod: React.PropTypes.func.isRequired
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
              label: table.get('name')
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
          label: table.tableName,
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
          Select the tables you'd like to import to autogenerate your configuration. <br/>
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
      <div className="row text-center">
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
