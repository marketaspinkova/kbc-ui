import PropTypes from 'prop-types';
import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import Tooltip from '../../../../../react/common/Tooltip';

const ItemType = 'PhaseRow';

const phaseRowSource = {
  beginDrag(props) {
    return {
      id: props.phase.get('id')
    };
  }
};

const phaseRowTarget = {
  canDrop(props, monitor) {
    const draggedId = monitor.getItem().id;
    return draggedId === props.phase.get('id');
  },
  hover(props, monitor) {
    const draggedId = monitor.getItem().id;
    const hoverId = props.phase.get('id');

    if (draggedId === hoverId) {
      return;
    }

    props.onPhaseMove(hoverId, draggedId);
  }
};

function collectForDragSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

function collectForDropTarget(connect) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

let PhaseEditRow = React.createClass({
  propTypes: {
    toggleHide: PropTypes.func.isRequired,
    phase: PropTypes.object.isRequired,
    onPhaseMove: PropTypes.func.isRequired,
    onMarkPhase: PropTypes.func.isRequired,
    togglePhaseIdChange: PropTypes.func.isRequired,
    isMarked: PropTypes.bool.isRequired,
    toggleAddNewTask: PropTypes.func.isRequired,
    color: PropTypes.string,
    isPhaseHidden: PropTypes.bool,

    // react-dnd
    isDragging: PropTypes.bool.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired
  },

  render() {
    const { isDragging, connectDragSource, connectDropTarget } = this.props;
    let style = {
      opacity: isDragging ? 0.5 : 1,
      'backgroundColor': isDragging ? '#ffc' : this.props.color,
      cursor: 'move'
    };
    if (this.props.isPhaseHidden) {
      style.borderBottom = '2px groove';
    }
    return connectDragSource(connectDropTarget(
      <tr style={style} onClick={this.onRowClick}>

        <td>
          <div className="row">
            <div className="col-xs-3">
              <i  className="fa fa-bars"/>

            </div>
            <div className="col-xs-5">
              {this.renderSelectPhaseCheckbox()}
            </div>
          </div>
        </td>

        <td colSpan="5" className="kbc-cursor-pointer text-center">
          <div className="text-center form-group form-group-sm">
            <strong>
              <span>{this.props.phase.get('id')} </span>
            </strong>
            <Tooltip
              tooltip="rename phase">
              <span
                onClick={this.toggleTitleChange}
                className="kbc-icon-pencil"/>
            </Tooltip>
          </div>
        </td>

        <td>
          <div className="pull-right">
            <button
              className="btn btn-link"
              style={{padding: '2px'}}
              onClick={this.toggleTaskAdd}>
              <i className="kbc-icon-plus"/>
                New task
            </button>
          </div>
        </td>

      </tr>
    ));
  },

  renderSelectPhaseCheckbox() {
    return (
      <Tooltip
        tooltip="Select phase to merge">
        <input
          checked={this.props.isMarked}
          type="checkbox"
          onClick={this.toggleMarkPhase}
        />
      </Tooltip>
    );
  },

  toggleTaskAdd(e) {
    this.props.toggleAddNewTask();
    this.onStopPropagation(e);
  },

  toggleMarkPhase(e) {
    this.props.onMarkPhase(this.props.phase.get('id'), e.shiftKey);
    e.stopPropagation();
  },

  toggleTitleChange(e) {
    this.props.togglePhaseIdChange(this.props.phase.get('id'));
    this.onStopPropagation(e);
  },

  onRowClick(e) {
    this.props.toggleHide();
    e.preventDefault();
  },

  onStopPropagation(e) {
    e.preventDefault();
    e.stopPropagation();
  }

});

PhaseEditRow = DragSource(ItemType, phaseRowSource, collectForDragSource)(PhaseEditRow);
PhaseEditRow = DropTarget(ItemType, phaseRowTarget, collectForDropTarget)(PhaseEditRow);

export default PhaseEditRow;
