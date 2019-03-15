import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { OverlayTrigger, Popover } from 'react-bootstrap';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  render() {
    return (
      <OverlayTrigger overlay={this._renderPopover()}>
        <i className="fa fa-question-circle" />
      </OverlayTrigger>
    );
  },

  _renderPopover() {
    return (
      <Popover title="Supported Date Formats">
        <ul>
          <li>%Y – year (e.g. 2010)</li>
          <li>%m – month (01 - 12)</li>
          <li>%d – day (01 - 31)</li>
          <li>%I – hour (01 - 12)</li>
          <li>%H – hour 24 format (00 - 23)</li>
          <li>%M – minutes (00 - 59)</li>
          <li>%S – seconds (00 - 59)</li>
          <li>%f – microsecond as a decimal number, zero-padded on the left.(000000, 000001, ..., 999999)</li>
        </ul>
      </Popover>
    );
  }
});
