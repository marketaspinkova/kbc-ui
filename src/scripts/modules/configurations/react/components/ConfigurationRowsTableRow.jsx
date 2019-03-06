import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ActivateDeactivateButton from '../../../../react/common/ActivateDeactivateButton';
import DeleteConfigurationRowButton from './DeleteConfigurationRowButton';
import RunComponentButton from '../../../components/react/components/RunComponentButton';
import ChangeOrderHandle from './ChangeOrderHandle';
import ConfigurationRowsTableCell from './ConfigurationRowsTableCell';
import RoutesStore from '../../../../stores/RoutesStore';

const TableRow = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    componentId: React.PropTypes.string.isRequired,
    component: React.PropTypes.object.isRequired,
    configurationId: React.PropTypes.string.isRequired,
    row: React.PropTypes.object.isRequired,
    rowNumber: React.PropTypes.number.isRequired,
    columns: React.PropTypes.object.isRequired,
    linkTo: React.PropTypes.string.isRequired,
    isDeletePending: React.PropTypes.bool.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    isEnableDisablePending: React.PropTypes.bool.isRequired,
    onEnableDisable: React.PropTypes.func.isRequired,
    disabledMove: React.PropTypes.bool.isRequired,
    disabledMoveLabel: React.PropTypes.string.isRequired,
    orderPending: React.PropTypes.bool.isRequired
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
