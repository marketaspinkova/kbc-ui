import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import { Loader } from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    show: PropTypes.bool,
    text: PropTypes.string,
    loaderSize: PropTypes.oneOf(['normal', '2x', '4x']),
    styles: PropTypes.object
  },

  getDefaultProps() {
    return {
      show: false,
      text: 'Loading data...',
      loaderSize: 'normal',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '20px',
        maxWidth: '1000px',
        minHeight: '300px'
      }
    };
  },

  render() {
    if (!this.props.show) {
      return null;
    }

    return (
      <div style={this.props.styles}>
        <Loader
          className={classnames({
            'fa-2x': this.props.loaderSize === '2x',
            'fa-4x': this.props.loaderSize === '4x'
          })}
        />
        <p>{this.props.text}</p>
      </div>
    );
  }
});
