import React from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import {SearchBar} from '@keboola/indigo-ui';
import Immutable from 'immutable';
import ConfigurationRowsTable from './ConfigurationRowsTable';
import CreateConfigurationRowButton from './CreateConfigurationRowButton';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    rows: React.PropTypes.object.isRequired,
    configurationId: React.PropTypes.string.isRequired,
    componentId: React.PropTypes.string.isRequired,
    component: React.PropTypes.object.isRequired,
    rowDelete: React.PropTypes.func.isRequired,
    rowEnableDisable: React.PropTypes.func.isRequired,
    rowDeletePending: React.PropTypes.func.isRequired,
    rowEnableDisablePending: React.PropTypes.func.isRequired,
    rowLinkTo: React.PropTypes.string.isRequired,
    onOrder: React.PropTypes.func.isRequired,
    orderPending: React.PropTypes.object.isRequired,
    onRowCreated: React.PropTypes.func.isRequired,
    rowCreateEmptyConfig: React.PropTypes.func.isRequired,
    objectName: React.PropTypes.string,
    header: React.PropTypes.array,
    columns: React.PropTypes.object,
    filter: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      header: ['Name', 'Description'],
      columns: [
        function(row) {
          return row.get('name') !== '' ? row.get('name') : 'Untitled';
        },
        function(row) {
          return (
            <small>
              {row.get('description') !== '' ? row.get('description') : 'No description'}
            </small>
          );
        }
      ],
      objectName: 'Row'
    };
  },

  getInitialState() {
    return {
      query: '',
      rows: Immutable.List()
    };
  },

  componentWillReceiveProps(nextProps) {
    const state = this.state;
    this.setState({
      rows: nextProps.rows
        .filter(function(row) {
          return nextProps.filter(row, state.query);
        }).toList()
    });
  },

  onChangeSearch(query) {
    this.setState({
      query: query,
      rows: this.props.rows.filter(function(row) {
        return this.props.filter(row, query);
      }, this).toList()
    });
  },

  onOrder(orderedIds, movedRowId) {
    const orderedItems = this.props.rows.sort(function(a, b) {
      if (orderedIds.indexOf(a.get('id')) < orderedIds.indexOf(b.get('id'))) {
        return -1;
      }
      if (orderedIds.indexOf(a.get('id')) > orderedIds.indexOf(b.get('id'))) {
        return 1;
      }
      return 0;
    });
    this.setState({
      rows: orderedItems
    });
    return this.props.onOrder(orderedIds, movedRowId);
  },

  renderTable() {
    const props = this.props;
    const state = this.state;
    if (this.state.rows.size === 0) {
      return (
        <div className="kbc-inner-padding">
          No results found.
        </div>
      );
    } else {
      return (
        <ConfigurationRowsTable
          columns={props.columns}
          header={props.header}
          componentId={props.componentId}
          component={props.component}
          configurationId={props.configurationId}
          rowLinkTo={props.rowLinkTo}
          rowDeletePending={props.rowDeletePending}
          rowDelete={props.rowDelete}
          rowEnableDisablePending={props.rowEnableDisablePending}
          rowEnableDisable={props.rowEnableDisable}
          disabledMove={state.query !== ''}
          onOrder={this.onOrder}
          rows={this.state.rows}
          orderPending={this.props.orderPending}
        />
      );
    }
  },

  renderNewConfigRowButton() {
    return (
      <CreateConfigurationRowButton
        componentType={this.props.component.get('type')}
        objectName={this.props.objectName}
        componentId={this.props.componentId}
        configId={this.props.configurationId}
        emptyConfig={this.props.rowCreateEmptyConfig}
        onRowCreated={this.props.onRowCreated}
      />
    );
  },

  render() {
    return (
      <div>
        <div className="kbc-inner-padding">
          <SearchBar
            query={this.state.query}
            onChange={this.onChangeSearch}
            additionalActions={this.renderNewConfigRowButton()}
          />
        </div>
        {this.renderTable()}
      </div>
    );
  }
});
