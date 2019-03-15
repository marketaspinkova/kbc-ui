import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';
import { Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    component: PropTypes.object.isRequired,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    isValid: PropTypes.bool,
    isSaving: PropTypes.bool,
    withButtons: PropTypes.bool
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
