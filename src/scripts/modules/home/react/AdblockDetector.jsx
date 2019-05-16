import React from 'react';
import createReactClass from 'create-react-class';
import { AlertBlock } from '@keboola/indigo-ui';
import detectAdblock from '../../../utils/detectAdblock';

export default createReactClass({
  getInitialState() {
    return {
      detected: false
    };
  },

  componentDidMount() {
    this.check();
  },

  render() {
    if (!this.state.detected) {
      return null;
    }

    return (
      <div className="kbc-overview-component-container">
        <AlertBlock type="warning" title="Adblock was detected">
          The enabled adblock plugin was detected. It is strongly recommended turn it off for our
          application. We have no ads here anyway.
        </AlertBlock>
      </div>
    );
  },

  check() {
    this.setState({ detected: detectAdblock() });
  }
});
