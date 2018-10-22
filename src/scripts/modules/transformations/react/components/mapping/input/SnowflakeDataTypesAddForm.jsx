import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import _ from 'underscore';
import { Input } from '../../../../../../react/common/KbcBootstrap';
import { Button } from 'react-bootstrap';
import Select from 'react-select';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    datatypes: React.PropTypes.object.isRequired,
    columnValue: React.PropTypes.string.isRequired,
    datatypeValue: React.PropTypes.string.isRequired,
    sizeValue: React.PropTypes.string.isRequired,
    columnsOptions: React.PropTypes.array.isRequired,
    datatypeOptions: React.PropTypes.array.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    showSize: React.PropTypes.bool.isRequired,
    convertEmptyValuesToNullValue: React.PropTypes.bool.isRequired,

    handleAddDataType: React.PropTypes.func.isRequired,
    columnOnChange: React.PropTypes.func.isRequired,
    datatypeOnChange: React.PropTypes.func.isRequired,
    sizeOnChange: React.PropTypes.func.isRequired,
    convertEmptyValuesToNullOnChange: React.PropTypes.func.isRequired,

    availableColumns: React.PropTypes.array.isRequired
  },

  _handleSizeOnChange(e) {
    return this.props.sizeOnChange(e.target.value);
  },

  _getDatatypeOptions() {
    return _.map(this.props.datatypeOptions, datatype => ({
      label: datatype,
      value: datatype
    }));
  },

  _convertEmptyValuesToNullOnChange(e) {
    return this.props.convertEmptyValuesToNullOnChange(e.target.checked);
  },

  render() {
    return (
      <div className="well">
        <div className="row">
          <span className="col-xs-4">
            <Select
              name="add-column"
              value={this.props.columnValue}
              disabled={this.props.disabled}
              placeholder="Column"
              onChange={this.props.columnOnChange}
              options={this.props.availableColumns}
            />
          </span>
          <span className="col-xs-4">
            <Select
              name="add-datatype"
              value={this.props.datatypeValue}
              disabled={this.props.disabled}
              placeholder="Datatype"
              onChange={this.props.datatypeOnChange}
              options={this._getDatatypeOptions()}
            />
          </span>
          <span className="col-xs-4">
            <Input
              type="text"
              name="add-size"
              value={this.props.sizeValue}
              disabled={this.props.disabled || !this.props.showSize}
              placeholder="Length, eg. 38,0"
              onChange={this._handleSizeOnChange}
            />
          </span>
        </div>
        <div className="row">
          <span className="col-xs-6">
            <Input
              checked={this.props.convertEmptyValuesToNullValue}
              onChange={this._convertEmptyValuesToNullOnChange}
              standalone={true}
              type="checkbox"
              label={
                <span>
                  {'Convert empty values to '}
                  {<code>null</code>}
                </span>
              }
            />
          </span>
          <span className="col-xs-6 text-right">
            <Button
              className="btn-success"
              onClick={this.props.handleAddDataType}
              disabled={this.props.disabled || !this.props.columnValue || !this.props.datatypeValue}
            >
              Create data type
            </Button>
          </span>
        </div>
        <div className="row" style={{ paddingTop: '10px' }}>
          <div className="help-block col-xs-12">
            <div>
              <code>VARCHAR(255)</code>
              default for primary key columns
            </div>
            <div>
              <code>VARCHAR NOT NULL</code>
              default for all other columns
            </div>
          </div>
        </div>
      </div>
    );
  }
});
