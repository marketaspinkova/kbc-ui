import React from 'react';
import Immutable from 'immutable';
import PureRenderMixin from 'react-immutable-render-mixin';
import { OverlayTrigger, Popover } from 'react-bootstrap';

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
      <Popover title={`Preview - ${this.props.columnName}`}>
        {!this.props.tableData ? (
          'Loading data ...'
        ) : (
          <ul>
            {this._getColumnValues()
              .map((value) => <li>{value}</li>)
              .toArray()}
          </ul>
        )}
      </Popover>
    );
  },

  _getColumnValues() {
    const data = Immutable.fromJS(this.props.tableData);
    const columnIndex = data.first().indexOf(this.props.columnName);

    return data.shift().map((row) => row.get(columnIndex));
  }
});
