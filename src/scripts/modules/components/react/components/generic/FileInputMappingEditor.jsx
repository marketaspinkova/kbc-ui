import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import { List, fromJS } from 'immutable';
import Select from 'react-select';
import { PanelWithDetails } from '@keboola/indigo-ui';
import { Col, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    initialShowDetails: PropTypes.bool.isRequired
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
      <div className="form-horizontal">
        <FormGroup>
          <Col xs={2} componentClass={ControlLabel}>Tags</Col>
          <Col xs={10}>
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
          </Col>
        </FormGroup>
        <PanelWithDetails defaultExpanded={this.props.initialShowDetails}>
          <FormGroup>
            <Col xs={2} componentClass={ControlLabel}>
              Query
            </Col>
            <Col xs={10}>
              <FormControl
                type="text"
                value={this.props.value.get('query')}
                onChange={this._handleChangeQuery}
                disabled={this.props.disabled}
                placeholder="Search query"
              />
              <HelpBlock>Specify an Elasticsearch query to refine search</HelpBlock>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col xs={2} componentClass={ControlLabel}>Processed Tags</Col>
            <Col xs={10}>
              <Select.Creatable
                options={[]}
                name="processed_tags"
                value={this._getProcessedTags()}
                disabled={this.props.disabled}
                placeholder="Add tags"
                multi={true}
                onChange={this._handleChangeProcessedTags}
              />
              <HelpBlock>Add these tags to the files that were successfully processed</HelpBlock>
            </Col>
          </FormGroup>
        </PanelWithDetails>
      </div>
    );
  }
});
