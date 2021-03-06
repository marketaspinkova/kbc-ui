import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { fromJS } from 'immutable';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { truncate } from 'underscore.string';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    columnName: PropTypes.string.isRequired,
    tableData: PropTypes.object,
    error: PropTypes.string
  },

  render() {
    return (
      <OverlayTrigger placement="left" overlay={this.renderPopover()}>
        <Button bsStyle="link">
          <i className="fa fa-eye" />
        </Button>
      </OverlayTrigger>
    );
  },

  renderPopover() {
    return (
      <Popover
        id={`data-preview-${this.props.columnName}`}
        title={`Preview - ${this.props.columnName}`}
        className="kbc-overflow-break-word"
      >
        {!this.props.tableData ? (
          <p>{this.props.error ? this.props.error : 'Loading data...'}</p>
        ) : (
          <ul className="container-fluid">
            {this.getColumnValues()
              .map((value, index) => <li key={index}>{truncate(value, 100)}</li>)
              .toArray()}
          </ul>
        )}
      </Popover>
    );
  },

  getColumnValues() {
    const data = fromJS(this.props.tableData);
    const columnIndex = data.get('columns').indexOf(this.props.columnName);
    return data.get('rows').map(row => row.get(columnIndex).get('value'));
  }
});
