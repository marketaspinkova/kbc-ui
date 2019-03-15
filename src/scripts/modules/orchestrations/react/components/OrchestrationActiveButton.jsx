import PropTypes from 'prop-types';
import React from 'react';
import OrchestrationActionCreators from '../../ActionCreators';
import ActivateDeactivateButton from '../../../../react/common/ActivateDeactivateButton';

export default React.createClass({
  propTypes: {
    orchestration: PropTypes.object.isRequired,
    isPending: PropTypes.bool.isRequired,
    tooltipPlacement: PropTypes.string,
    mode: PropTypes.string
  },

  getDefaultProps() {
    return { tooltipPlacement: 'top' };
  },

  render() {
    return (
      <ActivateDeactivateButton
        activateTooltip="Enable Orchestration"
        deactivateTooltip="Disable Orchestration"
        isActive={this.props.orchestration.get('active')}
        isPending={this.props.isPending}
        onChange={this._handleActiveChange}
        tooltipPlacement={this.props.tooltipPlacement}
        mode={this.props.mode}
      />
    );
  },

  _handleActiveChange(newValue) {
    if (newValue) {
      return OrchestrationActionCreators.activateOrchestration(this.props.orchestration.get('id'));
    }

    return OrchestrationActionCreators.disableOrchestration(this.props.orchestration.get('id'));
  }
});
