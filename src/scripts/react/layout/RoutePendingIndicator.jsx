import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Loader } from '@keboola/indigo-ui';

/*
  Loading indicator is shown after few milisecond. Loader is not required for fast transitions.
*/
export default createReactClass({
  propTypes: {
    timeout: PropTypes.number
  },

  getInitialState() {
    return { isShown: false };
  },

  getDefaultProps() {
    return { timeout: 300 };
  },

  componentDidMount() {
    this.timeout = setTimeout(this.showIndicator, this.props.timeout);
  },

  componentWillUnmount() {
    return clearInterval(this.timeout);
  },

  render() {
    if (this.state.isShown) {
      return <Loader />;
    }

    return null;
  },

  showIndicator() {
    return this.setState({ isShown: true });
  }
});
