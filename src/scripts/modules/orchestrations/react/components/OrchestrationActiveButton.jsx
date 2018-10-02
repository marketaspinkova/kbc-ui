import React from 'react';
import OrchestrationActionCreators from '../../ActionCreators';
import ActivateDeactivateButton from '../../../../react/common/ActivateDeactivateButton';

export default React.createClass({
  propTypes: {
    orchestration: React.PropTypes.object.isRequired,
    isPending: React.PropTypes.bool.isRequired,
    tooltipPlacement: React.PropTypes.string
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
