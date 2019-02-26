import React, {PropTypes} from 'react';
import {Map, fromJS} from 'immutable';
import Tooltip from '../../../../../react/common/Tooltip';
import DateRangeModal from './DateRangeModal';

export default React.createClass({
  propTypes: {
    ranges: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    isEditing: PropTypes.bool.isRequired,
    localState: PropTypes.object.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    prepareLocalState: PropTypes.func.isRequired,
    maxRanges: PropTypes.number,
  },

  render() {
    return (
      <div className="form-group form-group-sme">
        {this.renderRangeModal()}
        <label className="control-label col-md-2">
          Date Ranges:
        </label>
        <div className="col-md-10">
          <div className="table">
            <div className="thead">
              <div className="tr">
                <div className="th">
                  <strong>Since</strong>
                </div>
                <div className="th">
                  <strong>Until</strong>
                </div>
                <div className="th" />
              </div>
            </div>
            <div className="tbody">
              {this.props.ranges.map((r, idx) => this.renderRange(r, idx))}
              {this.renderAddButton()}
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderRangeModal() {
    const modalData = this.props.localState.get('rangeModal', Map());
    const idx = modalData.get('idx', null);
    const range = modalData.get('range', Map());
    return (
      <DateRangeModal
        show={ idx !== null}
        startDate={range.get('startDate')}
        endDate={range.get('endDate')}
        onCancel={() => this.props.updateLocalState('rangeModal', Map())}
        onSet={(startDate, endDate) => this.updateRange(startDate, endDate, idx)}
      />);
  },

  renderRange(range, idx) {
    return (
      <div className="tr" key={idx}>
        <div className="td" >
          {range.get('startDate')}
        </div>
        <div className="td" >
          {range.get('endDate')}
        </div>
        { (!this.props.isEditing) ?
          <div className="td" />
          :
          <div className="td">
            <Tooltip tooltip="change" placement="top">
              <span className="btn btn-link" onClick={() => this.editRange(range, idx)}>
                <i className="fa fa-fw kbc-icon-pencil" />
              </span>
            </Tooltip>
            { idx !== 0 ?
              <Tooltip tooltip="remove" placement="top">
                <span className="btn btn-link" onClick={() => this.deleteRange(idx)}>
                  <i className="kbc-icon-cup kbc-cursor-pointer" />
                </span>
              </Tooltip> : null
            }
          </div>
        }
      </div>

    );
  },

  renderAddButton() {
    const maxRanges = this.props.maxRanges ? this.props.maxRanges : 2;

    return this.props.isEditing && this.props.ranges.count() < maxRanges ?
      <div className="tr">
        <button className="btn btn-link" onClick={this.addRange}>
          Add Date Range
        </button>
      </div>
      : null
  },

  addRange() {
    const newRange = fromJS({
      'startDate': '-4 days',
      'endDate': 'today'
    });
    this.props.onChange(this.props.ranges.push(newRange));
  },

  editRange(range, idx) {
    const modalData = fromJS({
      idx: idx,
      range: range
    });
    this.props.updateLocalState(['rangeModal'], modalData);
  },

  deleteRange(idx) {
    this.props.onChange(this.props.ranges.delete(idx));
  },

  updateRange(startDate, endDate, idx) {
    const rangeToUpdate = fromJS({
      startDate: startDate,
      endDate: endDate
    });
    const newRanges = this.props.ranges.map((r, ridx) => idx === ridx ? rangeToUpdate : r);
    this.props.onChange(newRanges);
  }
});
