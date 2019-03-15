import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ActivateDeactivateButton from '../../../../react/common/ActivateDeactivateButton';
import actionCreators from '../../actionCreators';

export default createReactClass({
  propTypes: {
    configId: PropTypes.string.isRequired,
    table: PropTypes.object.isRequired,
    tooltipPlacement: PropTypes.string.isRequired
  },

  getDefaultProps() {
    return { tooltipPlacement: 'top' };
  },

  render() {
    return (
      <ActivateDeactivateButton
        activateTooltip="Include table to project upload"
        deactivateTooltip="Exclude table from the project upload"
        isActive={this.props.table.getIn(['data', 'export'])}
        isPending={this.props.table.get('savingFields').contains('export')}
        onChange={this.handleExportChange}
        tooltipPlacement={this.props.tooltipPlacement}
      />
    );
  },

  handleExportChange(newExportStatus) {
    actionCreators.saveTableField(this.props.configId, this.props.table.get('id'), 'export', newExportStatus);
  }

});
