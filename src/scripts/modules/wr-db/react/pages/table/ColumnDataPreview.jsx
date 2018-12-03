import React from 'react';
import Immutable from 'immutable';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import PureRenderMixin from 'react-immutable-render-mixin';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    columnName: React.PropTypes.string.isRequired,
    tableData: React.PropTypes.array
  },

  render() {
    return (
      <OverlayTrigger placement="left" overlay={this._renderPopover()}>
        <button className="btn btn-link">
          <span className="fa fa-eye" />
        </button>
      </OverlayTrigger>
    );
  },

  _renderPopover() {
    return (
      <Popover id="wr-db-table-data-preview" title={`Preview - ${this.props.columnName}`}>
        {!this.props.tableData ? (
          'Loading data ...'
        ) : (
          <ul>
            {this._getColumnValues().map((value, index) => (
              <li key={index}>{value}</li>
            ))}
          </ul>
        )}
      </Popover>
    );
  },

  _getColumnValues() {
    const data = Immutable.fromJS(this.props.tableData);
    const columnIndex = data.get('columns').indexOf(this.props.columnName);

    return data
      .get('rows')
      .map(row => row.get(columnIndex).get('value'))
      .toArray();
  }
});
