import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import classNames from 'classnames';

const CLASS_MAP = {
  success: 'label-success',
  error: 'label-danger',
  processing: 'label-warning',
  canceled: 'label-canceled',
  cancelled: 'label-canceled',
  terminated: 'label-canceled',
  terminating: 'label-canceled',
  waiting: 'label-default',
  warn: 'label-danger',
  warning: 'label-danger'
};

export default createReactClass({
  propTypes: {
    status: PropTypes.string.isRequired
  },

  render() {
    return (
      <span className={this.classes()}>
        {this.props.status}
      </span>
    );
  },

  classes() {
    return classNames('label', CLASS_MAP[this.props.status], {
      processing: this.props.status === 'processing'
    });
  }

});