import React from 'react';
import createReactClass from 'create-react-class';
import { Button } from 'react-bootstrap';

export default createReactClass({
  propTypes: {
  },

  render() {
    return (
      <div>
        {this.renderEmptyIcon()}
      </div>
    );
  },

  renderEmptyIcon() {
    return (
      <div className="text-muted" style={{textAlign: 'center'}}>
        <i className="fa fa-fw fa-table" style={{fontSize: '60px'}} />
        <p>Add tables from Storage</p>
        {this.renderAddTableButton()}
      </div>
    );
  },

  renderAddTableButton() {
    return (
      <div>
        <Button bsStyle="success" onClick={this._handleAddTable}>
          <i className="fa fa-plus" /> Add Table
        </Button>
      </div>
    );
  },

  _handleAddTable() {
    return null;
  }
});
