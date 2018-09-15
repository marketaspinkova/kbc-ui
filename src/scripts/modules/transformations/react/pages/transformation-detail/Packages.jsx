import React, {PropTypes} from 'react';
import Select from '../../../../../react/common/Select';

export default React.createClass({
  propTypes: {
    transformation: PropTypes.object.isRequired,
    packages: PropTypes.object.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onEditChange: PropTypes.func.isRequired
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
            multi={true}
            disabled={this.props.isSaving}
            onChange={this.props.onEditChange}
            placeholder="Add packages..."
            isLoading={this.props.isSaving}
            allowCreate={true}
            trimMultiCreatedValues={true}
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
        {' '}<a href={documentationLink}>documentation</a>.
      </span>
    );
  }
});
