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
    disabled: React.PropTypes.bool.isRequired
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
      <div className="form-horizontal clearfix">
        <div className="row col-md-12">
          <Input
            type="text"
            label="Source"
            value={this.props.value.get('source')}
            disabled={this.props.disabled}
            placeholder=""
            onChange={this._handleChangeSource}
            labelClassName="col-xs-2"
            wrapperClassName="col-xs-10"
            autoFocus={true}
            help={
              <span>
                {'File will be uploaded from '}
                <code>{`/data/out/files/${this.props.value.get('source', '')}`}</code>
              </span>
            }
          />
        </div>
        <div className="row col-md-12">
          <div className="form-group">
            <label className="col-xs-2 control-label">Tags</label>
            <div className="col-xs-10">
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
            </div>
          </div>
        </div>
        <div className="row col-md-12">
          <PanelWithDetails defaultExpanded={this.state.showDetails}>
            <div className="form-horizontal clearfix">
              <div className="form-group">
                <div className="col-xs-10 col-xs-offset-2">
                  <Input
                    standalone={true}
                    type="checkbox"
                    label="Is public"
                    checked={this.props.value.get('is_public')}
                    onChange={this._handleChangeIsPublic}
                    disabled={this.props.disabled}
                    help="File will be public (accessible outside Keboola Connection)"
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className="col-xs-10 col-xs-offset-2">
                <Input
                  standalone={true}
                  type="checkbox"
                  label="Is permanent"
                  checked={this.props.value.get('is_permanent')}
                  onChange={this._handleChangeIsPermanent}
                  disabled={this.props.disabled}
                  help="File will be stored permanently (otherwise will be deleted after 180 days)"
                />
              </div>
            </div>
          </PanelWithDetails>
        </div>
      </div>
    );
  }
});
