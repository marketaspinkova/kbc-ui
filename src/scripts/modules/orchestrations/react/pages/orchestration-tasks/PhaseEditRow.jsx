import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Tooltip from '../../../../../react/common/Tooltip';

export default createReactClass({
  propTypes: {
    toggleHide: PropTypes.func.isRequired,
    phase: PropTypes.object.isRequired,
    onMarkPhase: PropTypes.func.isRequired,
    togglePhaseIdChange: PropTypes.func.isRequired,
    isMarked: PropTypes.bool.isRequired,
    toggleAddNewTask: PropTypes.func.isRequired,
    color: PropTypes.string,
    isPhaseHidden: PropTypes.bool,
    isDragging: PropTypes.bool
  },

  render() {
    let style = {
      opacity: this.props.isDragging ? 0.5 : 1,
      'backgroundColor': this.props.isDragging ? '#ffc' : this.props.color,
      cursor: 'move'
    };
    if (this.props.isPhaseHidden) {
      style.borderBottom = '2px groove';
    }

    return (
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
                className="kbc-icon-pencil"
              />
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
    );
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
