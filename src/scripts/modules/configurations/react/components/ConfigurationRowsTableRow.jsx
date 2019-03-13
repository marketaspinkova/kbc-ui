import PropTypes from 'prop-types';
import React from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import ActivateDeactivateButton from '../../../../react/common/ActivateDeactivateButton';
import DeleteConfigurationRowButton from './DeleteConfigurationRowButton';
import RunComponentButton from '../../../components/react/components/RunComponentButton';
import ChangeOrderHandle from './ChangeOrderHandle';
import ConfigurationRowsTableCell from './ConfigurationRowsTableCell';
import RoutesStore from '../../../../stores/RoutesStore';

const TableRow = React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    componentId: PropTypes.string.isRequired,
    component: PropTypes.object.isRequired,
    configurationId: PropTypes.string.isRequired,
    row: PropTypes.object.isRequired,
    rowNumber: PropTypes.number.isRequired,
    columns: PropTypes.object.isRequired,
    linkTo: PropTypes.string.isRequired,
    isDeletePending: PropTypes.bool.isRequired,
    onDelete: PropTypes.func.isRequired,
    isEnableDisablePending: PropTypes.bool.isRequired,
    onEnableDisable: PropTypes.func.isRequired,
    disabledMove: PropTypes.bool.isRequired,
    disabledMoveLabel: PropTypes.string.isRequired,
    orderPending: PropTypes.bool.isRequired
  },

  renderDragHandle() {
    return (
      <ChangeOrderHandle
        isPending={this.props.orderPending}
        disabled={this.props.disabledMove}
        disabledLabel={this.props.disabledMoveLabel}
      />
    );
  },

  render() {
    const router = RoutesStore.getRouter();


    const props = this.props;
    return (
      <div
        className="tr"
        data-id={props.row.get('id')}
        onClick={() => {
          router.transitionTo(this.props.linkTo, {config: this.props.configurationId, row: this.props.row.get('id')});
        }}
      >
        <div className="td" key="handle">
          {this.renderDragHandle()}
        </div>
        <div className="td" key="row-number">
          {this.props.rowNumber}
        </div>
        {this.props.columns.map(function(columnDefinition, index) {
          return (
            <div className="td kbc-break-all" key={index}>
              <ConfigurationRowsTableCell
                type={columnDefinition.get('type', 'value')}
                valueFn={columnDefinition.get('value')}
                row={props.row}
                component={props.component}
                componentId={props.componentId}
                configurationId={props.configurationId}
              />
            </div>
          );
        })}
        <div className="td text-right kbc-no-wrap">
          {this.renderRowActionButtons()}
        </div>
      </div>
    );
  },

  renderRowActionButtons() {
    const props = this.props;
    return [
      (<DeleteConfigurationRowButton
        key="delete"
        isPending={this.props.isDeletePending}
        onClick={this.props.onDelete}
      />),
      (<ActivateDeactivateButton
        key="activate"
        activateTooltip="Enable"
        deactivateTooltip="Disable"
        isActive={!this.props.row.get('isDisabled', false)}
        isPending={this.props.isEnableDisablePending}
        onChange={this.props.onEnableDisable}
      />),
      (<RunComponentButton
        key="run"
        title="Run"
        component={this.props.componentId}
        runParams={function() {
          return {
            config: props.configurationId,
            row: props.row.get('id')
          };
        }}
      >
        {this.renderRunModalContent()}
      </RunComponentButton>
      )
    ];
  },

  renderRunModalContent() {
    const rowName = this.props.row.get('name', 'Untitled');
    if (this.props.row.get('isDisabled')) {
      return 'You are about to run ' + rowName + '. Configuration ' + rowName + ' is disabled and will be forced to run ';
    } else {
      return 'You are about to run ' + rowName + '.';
    }
  }
});

export default TableRow;
