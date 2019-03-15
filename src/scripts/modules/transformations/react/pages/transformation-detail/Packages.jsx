import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Select from '../../../../../react/common/Select';
import {ExternalLink} from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    transformation: PropTypes.object.isRequired,
    packages: PropTypes.object.isRequired,
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
          Packages
        </h2>
        <div className="form-group">
          <Select
            name="packages"
            value={this.props.packages}
            multi
            disabled={this.props.isSaving || this.props.disabled}
            onChange={this.props.onEditChange}
            placeholder="Add packages..."
            isLoading={this.props.isSaving}
            allowCreate
            trimMultiCreatedValues
          />
          <span className="help-block">
            {this.hint()}
          </span>
        </div>
      </div>
    );
  },

  hint() {
    let documentationLink = '';
    switch (this.props.transformation.get('type')) {
      case 'r':
        documentationLink = 'https://help.keboola.com/manipulation/transformations/r/#packages';
        break;
      case 'python':
        documentationLink = 'https://help.keboola.com/manipulation/transformations/python/#packages';
        break;
      default:
        return null;
    }
    return (
      <span>
        Learn more about installation, usage and a list of pre-installed packages in the
        {' '}<ExternalLink href={documentationLink}>documentation</ExternalLink>.
      </span>
    );
  }
});
