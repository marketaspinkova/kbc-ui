import React from 'react';
import _ from 'underscore';
import { List, fromJS } from 'immutable';
import Select from 'react-select';
import { PanelWithDetails } from '@keboola/indigo-ui';
import { HelpBlock } from 'react-bootstrap';
import { Input } from '../../../../../react/common/KbcBootstrap';

export default React.createClass({
  propTypes: {
    value: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    initialShowDetails: React.PropTypes.bool.isRequired
  },

  _handleChangeQuery(e) {
    const value = this.props.value.set('query', e.target.value);
    return this.props.onChange(value);
  },

  _handleChangeTags(newOptions) {
    let value;
    const listOfValues = newOptions.map(newOption => newOption.value);
    const parsedValues = _.filter(_.invoke(listOfValues, 'trim'), val => val !== '');

    if (parsedValues.length === 0) {
      value = this.props.value.set('tags', List());
    } else {
      value = this.props.value.set('tags', fromJS(parsedValues));
    }

    return this.props.onChange(value);
  },

  _handleChangeProcessedTags(newOptions) {
    let value;
    const listOfValues = newOptions.map(newOption => newOption.value);
    const parsedValues = _.filter(_.invoke(listOfValues, 'trim'), val => val !== '');

    if (parsedValues.length === 0) {
      value = this.props.value.set('processed_tags', List());
    } else {
      value = this.props.value.set('processed_tags', fromJS(parsedValues));
    }

    return this.props.onChange(value);
  },

  _getTags() {
    const tags = this.props.value.get('tags', List()).toMap();

    return tags
      .map(tag => ({
        label: tag,
        value: tag,
        className: 'Select-create-option-placeholder'
      }))
      .toArray();
  },

  _getProcessedTags() {
    const tags = this.props.value.get('processed_tags', List()).toMap();

    return tags
      .map(tag => ({
        label: tag,
        value: tag,
        className: 'Select-create-option-placeholder'
      }))
      .toArray();
  },

  render() {
    return (
      <div className="form-horizontal clearfix">
        <div className="row col-md-12">
          <div className="form-group">
            <label className="col-xs-2 control-label">Tags</label>
            <div className="col-xs-10">
              <Select.Creatable
                options={[]}
                name="tags"
                autoFocus={true}
                value={this._getTags()}
                disabled={this.props.disabled}
                placeholder="Add tags"
                multi={true}
                onChange={this._handleChangeTags}
              />
            </div>
          </div>
        </div>
        <div className="row col-md-12">
          <PanelWithDetails defaultExpanded={this.props.initialShowDetails}>
            <div className="form-horizontal clearfix">
              <Input
                type="text"
                label="Query"
                value={this.props.value.get('query')}
                disabled={this.props.disabled}
                placeholder="Search query"
                onChange={this._handleChangeQuery}
                labelClassName="col-xs-2"
                wrapperClassName="col-xs-10"
                help={<HelpBlock>Specify an Elasticsearch query to refine search</HelpBlock>}
              />
              <div className="form-group">
                <label className="col-xs-2 control-label">Processed Tags</label>
                <div className="col-xs-10">
                  <Select.Creatable
                    options={[]}
                    name="processed_tags"
                    value={this._getProcessedTags()}
                    disabled={this.props.disabled}
                    placeholder="Add tags"
                    multi={true}
                    onChange={this._handleChangeProcessedTags}
                  />
                  <HelpBlock>Add these tags to files that were successfully processed</HelpBlock>
                </div>
              </div>
            </div>
          </PanelWithDetails>
        </div>
      </div>
    );
  }
});
