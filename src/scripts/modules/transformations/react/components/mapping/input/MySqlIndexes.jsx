import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import _ from 'underscore';
import { Button } from 'react-bootstrap';
import Select from 'react-select';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    indexes: React.PropTypes.object.isRequired,
    selectValue: React.PropTypes.object.isRequired,
    columnsOptions: React.PropTypes.array.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    selectOnChange: React.PropTypes.func.isRequired,
    handleAddIndex: React.PropTypes.func.isRequired,
    handleRemoveIndex: React.PropTypes.func.isRequired
  },

  _handleSelectOnChange(selected) {
    return this.props.selectOnChange(_.pluck(selected, 'value'));
  },

  _renderIndexes() {
    if (!this.props.indexes.count()) {
      return <div>No indexes set.</div>;
    }

    return this.props.indexes
      .map((index, key) => (
        <span key={key}>
          <span className="label label-default">
            {index.toArray().join(', ')}{' '}
            <span
              className="kbc-icon-cup kbc-cursor-pointer"
              onClick={() => {
                return this.props.handleRemoveIndex(key);
              }}
            />
          </span>{' '}
        </span>
      ))
      .toArray();
  },

  render() {
    return (
      <span>
        <div className="well">{this._renderIndexes()}</div>
        <div className="row">
          <div className="col-xs-9">
            <Select
              multi={true}
              name="add-indexes"
              value={this.props.selectValue.toJS()}
              disabled={this.props.disabled}
              placeholder="Select column(s) to create an index"
              onChange={this._handleSelectOnChange}
              options={this.props.columnsOptions}
            />
          </div>
          <div className="col-xs-3 kbc-col-button">
            <Button
              className="btn-success"
              onClick={this.props.handleAddIndex}
              disabled={this.props.disabled || this.props.selectValue.count() === 0}
            >
              Create Index
            </Button>
          </div>
        </div>
      </span>
    );
  }
});
