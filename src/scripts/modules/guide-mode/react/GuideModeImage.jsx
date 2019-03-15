import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Image} from 'react-bootstrap';

export default createReactClass({
  propTypes: {
    scriptsBasePath: PropTypes.string.isRequired,
    imageName: PropTypes.string
  },
  getImagePath() {
    return this.props.scriptsBasePath + require('../media/' + this.props.imageName);
  },
  render() {
    return (
      <span>
        <Image className="center-block" src={this.getImagePath()} responsive />
      </span>
    );
  }
});
