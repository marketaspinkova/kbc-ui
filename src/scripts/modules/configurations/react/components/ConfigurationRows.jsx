import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {SearchBar} from '@keboola/indigo-ui';
import ConfigurationRowsTable from './ConfigurationRowsTable';
import CreateConfigurationRowButton from './CreateConfigurationRowButton';

export default React.createClass({
  mixins: [PureRenderMixin],

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
    filter: React.PropTypes.func.isRequired,
    header: React.PropTypes.array,
    columns: React.PropTypes.object,
    objectName: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      header: ['Name', 'Description'],
      columns: [
        (row) => row.get('name') ? row.get('name') : 'Untitled',
        (row) => <small>{row.get('description') ? row.get('description') : 'No description'}</small>
      ],
      objectName: 'Row'
    };
  },

  getInitialState() {
    return {
      query: ''
    };
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
  },

  renderTable() {
    const rows = this.filteredRows();

    if (!rows.count()) {
      return (
        <div className="kbc-inner-padding">
          No results found.
        </div>
      );
    }

    return (
      <ConfigurationRowsTable
        columns={this.props.columns}
        header={this.props.header}
        componentId={this.props.componentId}
        component={this.props.component}
        configurationId={this.props.configurationId}
        rowLinkTo={this.props.rowLinkTo}
        rowDeletePending={this.props.rowDeletePending}
        rowDelete={this.props.rowDelete}
        rowEnableDisablePending={this.props.rowEnableDisablePending}
        rowEnableDisable={this.props.rowEnableDisable}
        disabledMove={this.state.query !== ''}
        onOrder={this.props.onOrder}
        rows={rows}
        orderPending={this.props.orderPending}
      />
    );
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

  filteredRows() {
    if (this.state.query) {
      return this.props.rows.filter((row) => this.props.filter(row, this.state.query))
    }

    return this.props.rows;
  },

  onChangeSearch(query) {
    this.setState({ query });
  }
});
