import React, {PropTypes} from 'react';
import {SearchBar} from '@keboola/indigo-ui';
// import classnames from 'classnames';

export default React.createClass({
  propTypes: {
    tables: PropTypes.object,
    isSaving: PropTypes.bool,
    isTablePending: PropTypes.func
  },

  renderTable() {
    return (
      <div className="table-config-rows table table-striped">
        <div className="thead" key="table-header">
          <div className="tr">
            <td> Table Name </td>
            <td> GoodData Title </td>
          </div>
        </div>
        <div className="tbody" ref="list">
          todo
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
            additionalActions={this.renderNewConfigRowButton()}
          />
        </div>
        {this.renderTable()}
      </div>
    );
  }
});
