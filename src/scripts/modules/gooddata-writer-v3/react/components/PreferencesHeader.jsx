import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

export default createReactClass({
  propTypes: {
    showAdvanced: PropTypes.bool.isRequired,
    onChangeShowAdvanced: PropTypes.func.isRequired
  },

  render() {
    const {showAdvanced} = this.props;
    return (
      <span className="text-center">
        <span className="checkbox">
          <label>
            <input
              checked={showAdvanced}
              onClick={() => this.props.onChangeShowAdvanced(!showAdvanced)}
              type="checkbox"/>
              Show Identifiers
          </label>
        </span>
      </span>
    );
  }
});
