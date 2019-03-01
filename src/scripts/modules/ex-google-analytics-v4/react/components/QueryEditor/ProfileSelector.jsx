import React, {PropTypes} from 'react';
import {Input} from './../../../../../react/common/KbcBootstrap';
import ProfileInfo from '../../ProfileInfo';

export default React.createClass({
  propTypes: {
    allProfiles: PropTypes.object.isRequired,
    selectedProfile: PropTypes.string,
    labelClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    label: PropTypes.string,
    isEditing: PropTypes.bool,
    onSelectProfile: PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      labelClassName: 'col-md-2',
      wrapperClassName: 'col-md-10',
      label: 'Profile'
    };
  },

  render() {
    if (this.props.isEditing) {
      return (
        <Input
          type="select"
          value={this.props.selectedProfile}
          label={this.props.label}
          labelClassName={this.props.labelClassName}
          wrapperClassName={this.props.wrapperClassName}
          onChange={this.onSelect}>

          <option value="">
            --all profiles--
          </option>

          {this.renderOptionsArray()}
        </Input>
      );
    } else {
      return (
        <div className="form-group">
          <label className={'control-label ' + this.props.labelClassName}>
            {this.props.label}
          </label>
          <div className={this.props.wrapperClassName}>
            <p className="form-control-static">
              {this.renderStaticProfile()}
            </p>
          </div>
        </div>
      );
    }
  },

  renderStaticProfile() {
    if (!this.props.selectedProfile) {
      return '-- all profiles --';
    }
    const found = this.props.allProfiles.find((p) => p.get('id') === this.props.selectedProfile);
    if (found) {
      return (<ProfileInfo profile={found}/>);
    } else {
      return 'Unknown profile(' + this.props.selectedProfile.toString() + ')';
    }
  },

  renderOptionsArray() {
    const groups = this.props.allProfiles.groupBy( (profile) =>
      profile.get('accountName') + '/ ' + profile.get('webPropertyName'));
    const options = groups.map((group, groupName) => {
      return (
        <optgroup key={groupName} label={groupName}>
          {group.map((item, optionIndex) => {
            return (
              <option key={optionIndex} value={item.get('id')}>
                {item.get('name')}
              </option>
            );
          }).toArray()}
        </optgroup>
      );
    }).toArray();

    return options;
  },

  onSelect(event) {
    const value = event.target.value;
    this.props.onSelectProfile(value);
  }
});
