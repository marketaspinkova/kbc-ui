import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import Tooltip from './Tooltip';

export default createReactClass({
  propTypes: {
    onDeleteFn: PropTypes.func.isRequired,
    tooltip: PropTypes.string.isRequired,
    isPending: PropTypes.bool
  },

  getDefaultProps() {
    return {
      isPending: false
    };
  },

  render() {
    if (this.props.isPending) {
      return (
        <Button bsStyle="link" disabled>
          <Loader />
        </Button>
      );
    }

    return (
      <Tooltip tooltip={this.props.tooltip} placement="top">
        <Button bsStyle="link" onClick={this.handleDelete}>
          <i className="fa kbc-icon-cup" />
        </Button>
      </Tooltip>
    );
  },

  handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onDeleteFn();
  }
});
