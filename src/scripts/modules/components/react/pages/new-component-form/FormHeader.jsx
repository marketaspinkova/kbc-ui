import React from 'react';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';
import { Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    component: React.PropTypes.object.isRequired,
    onSave: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    isValid: React.PropTypes.bool,
    isSaving: React.PropTypes.bool,
    withButtons: React.PropTypes.bool
  },

  getDefaultProps() {
    return { withButtons: true };
  },

  render() {
    return (
      <div className="row kbc-header">
        <div className="kbc-title">
          <ComponentIcon component={this.props.component} className="pull-left" />
          <h2>
            <ComponentName component={this.props.component} />
          </h2>
          <p>{this.props.component.get('description')}</p>
        </div>
        {this.props.withButtons && this._renderButtons()}
      </div>
    );
  },

  _renderButtons() {
    return (
      <div className="kbc-buttons">
        {this.props.isSaving && (
          <span>
            <Loader />{' '}
          </span>
        )}
        <Button bsStyle="link" disabled={this.props.isSaving} onClick={this.props.onCancel}>
          Cancel
        </Button>
        <Button bsStyle="success" disabled={!this.props.isValid || this.props.isSaving} onClick={this.props.onSave}>
          Create
        </Button>
      </div>
    );
  }
});
