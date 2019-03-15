import React from 'react';
import createReactClass from 'create-react-class';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import ImmutableRenderMixin from 'react-immutable-render-mixin';

export default createReactClass({
  mixins: [ImmutableRenderMixin],
  render() {
    return (
      <OverlayTrigger overlay={this._renderPopover()}>
        <span className="fa fa-question-circle" />
      </OverlayTrigger>
    );
  },

  _renderPopover() {
    return (
      <Popover title="Supported Date Formats">
        <ul>
          <li>yyyy – year (e.g. 2010)</li>
          <li>MM – month (01 - 12)</li>
          <li>dd – day (01 - 31)</li>
          <li>hh – hour (01 - 12)</li>
          <li>HH – hour 24 format (00 - 23)</li>
          <li>mm – minutes (00 - 59)</li>
          <li>ss – seconds (00 - 59)</li>
          <li>kk/kkkk – microseconds or fractions of seconds (00-99, 000-999, 0000-9999)</li>
          <li>GOODDATA - number of days since 1900-01-01</li>
        </ul>
      </Popover>
    );
  }
});
