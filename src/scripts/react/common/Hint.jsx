import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import _ from 'underscore';
import {OverlayTrigger, Popover} from 'react-bootstrap';

export default createReactClass({
  propTypes: {
    title: PropTypes.string.isRequired,
    children: PropTypes.any.isRequired
  },
  mixins: [PureRenderMixin],

  render() {
    return (
      <OverlayTrigger overlay={this.popover()}>
        <span className="fa fa-question-circle kbc-cursor-pointer"/>
      </OverlayTrigger>
    );
  },

  popover() {
    return (
      <Popover id={_.uniqueId('hint_')} title={this.props.title}>
        {this.props.children}
      </Popover>
    );
  }
});
