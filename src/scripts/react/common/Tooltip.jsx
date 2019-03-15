import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import _ from 'underscore';

export default createReactClass({
  propTypes: {
    tooltip: PropTypes.any.isRequired,
    id: PropTypes.string,
    children: PropTypes.any,
    placement: PropTypes.string
  },

  getDefaultProps() {
    return {
      placement: 'right'
    };
  },

  render() {
    const tooltip = (
      <Tooltip id={this.props.id || _.uniqueId('tooltip_')}>
        {this.props.tooltip}
      </Tooltip>);
    return (
      <OverlayTrigger placement={this.props.placement} overlay={tooltip}>
        {this.props.children}
      </OverlayTrigger>
    );
  }
});
