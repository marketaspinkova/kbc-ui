import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import OrchestrationActionCreators from '../../ActionCreators';
import ActivateDeactivateSwitch from '../../../../react/common/ActivateDeactivateSwitch';

export default createReactClass({
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
      <ActivateDeactivateSwitch
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
