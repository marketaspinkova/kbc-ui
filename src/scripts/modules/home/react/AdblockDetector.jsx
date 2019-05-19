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
        <AlertBlock type="warning" title="Adblock detected">
          <p>
            We have detected that your browser is blocking advertisements. This can interfere with
            our application and lead to seemingly missing things.
            <br />
            We strongly recommend to whitelist the current site ({window.location.hostname}). We
            have no ads here anyway.
          </p>
        </AlertBlock>
      </div>
    );
  },

  check() {
    this.setState({ detected: detectAdblock() });
  }
});
