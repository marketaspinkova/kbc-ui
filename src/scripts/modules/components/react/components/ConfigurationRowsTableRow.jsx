import React from 'react';
import ImmutableRenderMixin from '../../../../react/mixins/ImmutableRendererMixin';
import ActivateDeactivateButton from '../../../../react/common/ActivateDeactivateButton';
import DeleteConfigurationRowButton from './DeleteConfigurationRowButton';
import RunComponentButton from './RunComponentButton';
import { Link } from 'react-router';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash/flow';
import { findDOMNode } from 'react-dom';

const ItemType = 'TableRow';

const rowSource = {
  beginDrag(props) {
    return {
      id: props.row.get('id')
    };
  }
};

const rowTarget = {
  canDrop(props, monitor) {
    const draggedId = monitor.getItem().id;
    return draggedId === props.row.get('id');
  },
  hover(props, monitor) {
    const draggedId = monitor.getItem().id;
    const hoverId = props.row.get('id');

    if (draggedId === hoverId) {
      return;
    }

    props.onMove(hoverId, draggedId);
  }
};

function collectForDragSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}


function collectForDropTarget(connect) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

const TableRow = React.createClass({
  displayName: 'ConfigurationRowsTableRow',

  mixins: [ImmutableRenderMixin],

  propTypes: {
    componentId: React.PropTypes.string.isRequired,
    configurationId: React.PropTypes.string.isRequired,
    row: React.PropTypes.object.isRequired,
    columns: React.PropTypes.array.isRequired,
    linkTo: React.PropTypes.string.isRequired,
    isDeletePending: React.PropTypes.bool.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    isEnableDisablePending: React.PropTypes.bool.isRequired,
    onEnableDisable: React.PropTypes.func.isRequired,
    onMove: React.PropTypes.func.isRequired,

    // react-dnd
    isDragging: React.PropTypes.bool.isRequired,
    connectDragPreview: React.PropTypes.func.isRequired,
    connectDragSource: React.PropTypes.func.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired
  },

  render() {
    const { isDragging, connectDragPreview, connectDragSource, connectDropTarget } = this.props;
    let style = {
      opacity: isDragging ? 0.5 : 1,
      'backgroundColor': isDragging ? '#ffc' : null
    };
    const props = this.props;
    return (
        <Link
          to={this.props.linkTo}
          params={{config: this.props.configurationId, row: this.props.row.get('id')}}
          className="tr"
          style={style}
          ref={function(instance) {
            const node = findDOMNode(instance);
            connectDragPreview(node);
            connectDropTarget(node);
          }}
        >
          <div className="td" key="dnd-handle">
            {connectDragSource(<span className="fa fa-bars fa-fw" style={{cursor: 'move'}} />)}
          </div>
          {this.props.columns.map(function(columnFunction, columnIndex) {
            return (
              <div className="td kbc-break-all" key={columnIndex}>
                {columnFunction(props.row)}
              </div>
            );
          })}
          <div className="td text-right kbc-no-wrap">
            {this.renderRowActionButtons()}
          </div>
        </Link>
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

export default flow(
  DragSource(ItemType, rowSource, collectForDragSource),
  DropTarget(ItemType, rowTarget, collectForDropTarget)
)(TableRow);