import React from 'react';
import Immutable from 'immutable';
import {OverlayTrigger, Popover} from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    columnName: React.PropTypes.string.isRequired,
    tableData: React.PropTypes.object,
    error: React.PropTypes.string
  },

  render() {
    return (
      <OverlayTrigger placement="left" overlay={this.renderPopover()}>
        <button className="btn btn-link">
          <span className="fa fa-eye" />
        </button>
      </OverlayTrigger>
    );
  },


  renderPopover() {
    return (
      <Popover id="data-preview" title={`Preview - ${this.props.columnName}`}>
        {
          !this.props.tableData ?
            <span>{this.props.error ? this.props.error : 'Loading data...'}</span>
            :
            <ul>
              {this.getColumnValues()
                .map((value, index) =>
                  <li key={index}>{value}</li>
                ).toArray()
              }
            </ul>
        }
      </Popover>
    );
  },

  getColumnValues() {
    const data = Immutable.fromJS(this.props.tableData);
    const columnIndex = data.get('columns').indexOf(this.props.columnName);
    return data.get('rows')
      .map(row => row.get(columnIndex).get('value'))
    ;
  }

});
