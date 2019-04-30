import React from 'react';
import createReactClass from 'create-react-class';
import { Popover, OverlayTrigger } from 'react-bootstrap';

export default createReactClass({
  render() {
    return (
      <OverlayTrigger overlay={this._renderPopover()}>
        <span className="fa fa-question-circle" />
      </OverlayTrigger>
    );
  },

  _renderPopover() {
    return (
      <Popover title="Maximum possible values" id="gooddata-writer-v3-data-type-hint">
        <ul className="container-fluid">
          <li>VARCHAR – 10000</li>
          <li>DECIMAL - 15,6</li>
        </ul>
      </Popover>
    );
  }
});
