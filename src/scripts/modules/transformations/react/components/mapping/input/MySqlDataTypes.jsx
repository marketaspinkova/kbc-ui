import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import _ from 'underscore';
import { Input } from '../../../../../../react/common/KbcBootstrap';
import { ListGroup, ListGroupItem, Button } from 'react-bootstrap';
import Select from 'react-select';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    datatypes: React.PropTypes.object.isRequired,
    selectValue: React.PropTypes.string.isRequired,
    inputValue: React.PropTypes.string.isRequired,
    columnsOptions: React.PropTypes.array.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    selectOnChange: React.PropTypes.func.isRequired,
    inputOnChange: React.PropTypes.func.isRequired,
    handleAddDataType: React.PropTypes.func.isRequired,
    handleRemoveDataType: React.PropTypes.func.isRequired
  },

  _handleInputOnChange(e) {
    return this.props.inputOnChange(e.target.value);
  },

  _getColumnsOptions() {
    return _.filter(
      this.props.columnsOptions,
      option => !_.contains(_.keys(this.props.datatypes.toJS()), option.value)
    );
  },

  render() {
    return (
      <span>
        <div className="row">
          <span className="col-xs-12">
            {!this.props.datatypes.count() ? (
              <p>
                <small>No data types set yet.</small>
              </p>
            ) : (
              <ListGroup>
                {this.props.datatypes
                  .sort()
                  .map(
                    (datatype, key) => (
                      <ListGroupItem key={key}>
                        <small>
                          <strong>{key}</strong> <code>{datatype}</code>
                          <i
                            className="kbc-icon-cup kbc-cursor-pointer pull-right"
                            onClick={() => {
                              return this.props.handleRemoveDataType(key);
                            }}
                          />
                        </small>
                      </ListGroupItem>
                    ),

                    this
                  )
                  .toArray()}
              </ListGroup>
            )}
          </span>
        </div>
        <div className="well">
          <div className="row">
            <span className="col-xs-6">
              <Select
                name="add-datatype-column"
                value={this.props.selectValue}
                disabled={this.props.disabled}
                placeholder="Select column"
                onChange={this.props.selectOnChange}
                options={this._getColumnsOptions()}
              />
            </span>
            <span className="col-xs-6">
              <Input
                type="text"
                name="add-datatype-value"
                value={this.props.inputValue}
                disabled={this.props.disabled || !this.props.selectValue}
                placeholder="Eg. VARCHAR(255)"
                onChange={this._handleInputOnChange}
                autoComplete="off"
              />
            </span>
          </div>
          <div className="row" style={{ paddingTop: '0px' }}>
            <div className="help-block col-xs-12 text-right">
              <Button
                className="btn-success"
                onClick={this.props.handleAddDataType}
                disabled={this.props.disabled || !this.props.selectValue || !this.props.inputValue}
              >
                Create data type
              </Button>
            </div>
          </div>
          <div className="row" style={{ paddingTop: '10px' }}>
            <div className="help-block col-xs-12">
              <small>
                <div>
                  <code>VARCHAR(255)</code>
                  default for primary key columns
                </div>
                <div>
                  <code>TEXT</code>
                  default for all other columns
                </div>
              </small>
            </div>
          </div>
        </div>
      </span>
    );
  }
});
