import PropTypes from 'prop-types';
import React from 'react';
import { ExternalLink } from '@keboola/indigo-ui';
import Select from '../../../../../react/common/Select';

export default React.createClass({
  propTypes: {
    tags: PropTypes.object.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onEditChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool
  },

  getDefaultProps() {
    return {
      disabled: false
    };
  },

  render() {
    return (
      <div>
        <h2 style={{lineHeight: '32px'}}>
          Stored Files
        </h2>
        <div className="form-group">
          <Select
            name="tags"
            value={this.props.tags}
            multi={true}
            disabled={this.props.isSaving || this.props.disabled}
            onChange={this.props.onEditChange}
            placeholder="Add tags..."
            isLoading={this.props.isSaving}
            allowCreate={true}
            trimMultiCreatedValues={true}
          />
          <span className="help-block">
            The latest file with a given tag will be saved to <code>/data/in/user/&#123;tag&#125;</code>.
            For writing files back to Storage, please read <ExternalLink href="https://developers.keboola.com/extend/common-interface/manifest-files/#dataoutfiles-manifests">documentation</ExternalLink>.
          </span>
        </div>
      </div>
    );
  }
});
