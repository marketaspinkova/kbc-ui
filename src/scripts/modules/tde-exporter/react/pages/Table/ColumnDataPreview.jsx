import React from 'react';
import { fromJS } from 'immutable';
import PureRenderMixin from 'react-immutable-render-mixin';
import { OverlayTrigger, Popover } from 'react-bootstrap';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    columnName: React.PropTypes.string.isRequired,
    tableData: React.PropTypes.object
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
      <Popover id="preview_popover" title={`Preview - ${this.props.columnName}`}>
        {!this.props.tableData ? (
          'Loading data ...'
        ) : (
          <ul>
            {this._getColumnValues()
              .map((value, index) => <li key={index}>{value}</li>)
              .toArray()}
          </ul>
        )}
      </Popover>
    );
  },

  _getColumnValues() {
    const data = fromJS(this.props.tableData);
    const columnIndex = data.get('columns').indexOf(this.props.columnName);

    return data.get('rows').map(row => row.get(columnIndex).get('value'));
  }
});
