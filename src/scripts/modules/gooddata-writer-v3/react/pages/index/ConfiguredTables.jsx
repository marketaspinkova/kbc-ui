import React, {PropTypes} from 'react';
import {SearchBar} from '@keboola/indigo-ui';
// import classnames from 'classnames';

export default React.createClass({
  propTypes: {
    tables: PropTypes.object,
    isSaving: PropTypes.bool,
    isTablePending: PropTypes.func,
    newTableButton: PropTypes.object
  },

  getInitialState() {
    return {query: ''};
  },

  renderTable() {
    return (
      <div className="table-config-rows table table-striped">
        <div className="thead" key="table-header">
          <div className="tr">
            <span className="th"> <strong>Table Name</strong> </span>
            <span className="th"> <strong>GoodData Title</strong></span>
          </div>
        </div>
        <div className="tbody" ref="list">
          {this.props.tables.map(this.renderTableRow).toArray()}
        </div>
      </div>
    );
  },

  renderTableRow(table, tableId) {
    return (
      <div className="tr" key={tableId}>
        <div className="td">
          {tableId}
        </div>
        <div className="td">
          {table.get('title')}
        </div>
      </div>
    );
  },


  render() {
    return (
      <div>
        <div className="kbc-inner-padding">
          <SearchBar
            query={this.state.query}
            onChange={this.onChangeSearch}
            additionalActions={this.props.newTableButton}
          />
        </div>
        {this.renderTable()}
      </div>
    );
  }
});
