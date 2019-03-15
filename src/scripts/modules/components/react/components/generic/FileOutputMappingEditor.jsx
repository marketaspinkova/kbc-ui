import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import { List, fromJS } from 'immutable';
import Select from 'react-select';
import { PanelWithDetails } from '@keboola/indigo-ui';
import { Col, FormGroup, FormControl, ControlLabel, Checkbox, HelpBlock } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  getInitialState() {
    return { showDetails: false };
  },

  _handleChangeSource(e) {
    const value = this.props.value.set('source', e.target.value.trim());
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

  _handleChangeIsPublic(e) {
    const value = this.props.value.set('is_public', e.target.checked);
    return this.props.onChange(value);
  },

  _handleChangeIsPermanent(e) {
    const value = this.props.value.set('is_permanent', e.target.checked);
    return this.props.onChange(value);
  },

  _getTags() {
    const tags = this.props.value.get('tags', List());

    return tags
      .map(tag => ({
        label: tag,
        value: tag
      }))
      .toArray();
  },

  render() {
    return (
      <div className="form-horizontal">
        <FormGroup>
          <Col xs={2} componentClass={ControlLabel}>
            Source
          </Col>
          <Col xs={10}>
            <FormControl
              type="text"
              autoFocus
              value={this.props.value.get('source')}
              onChange={this._handleChangeSource}
              disabled={this.props.disabled}
            />
            <HelpBlock>
              File will be uploaded from <code>{`/data/out/files/${this.props.value.get('source', '')}`}</code>
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col xs={2} componentClass={ControlLabel}>
            Tags
          </Col>
          <Col xs={10}>
            <Select.Creatable
              options={[]}
              name="tags"
              value={this._getTags()}
              disabled={this.props.disabled}
              placeholder="Add tags"
              multi={true}
              onChange={this._handleChangeTags}
            />
            <HelpBlock>File will be assigned these tags</HelpBlock>
          </Col>
        </FormGroup>
        <PanelWithDetails defaultExpanded={this.state.showDetails}>
          <FormGroup>
            <Col xs={10} xsOffset={2}>
              <Checkbox
                checked={this.props.value.get('is_public')}
                onChange={this._handleChangeIsPublic}
                disabled={this.props.disabled}
              >
                Is public
              </Checkbox>
              <HelpBlock>
                File will be public (accessible outside Keboola Connection)
              </HelpBlock>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col xs={10} xsOffset={2}>
              <Checkbox
                checked={this.props.value.get('is_permanent')}
                onChange={this._handleChangeIsPermanent}
                disabled={this.props.disabled}
              >
                Is permanent
              </Checkbox>
              <HelpBlock>
                File will be stored permanently (otherwise it will be deleted after 180 days)
              </HelpBlock>
            </Col>
          </FormGroup>
        </PanelWithDetails>
      </div>
    );
  }
});
