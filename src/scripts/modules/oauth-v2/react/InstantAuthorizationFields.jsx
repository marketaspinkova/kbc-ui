import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Alert} from 'react-bootstrap';

export default createReactClass({

  propTypes: {
    authorizedFor: PropTypes.string,
    componentId: PropTypes.string.isRequired,
    onChangeFn: PropTypes.func,
    infoText: PropTypes.string,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <div>
        {!!this.props.infoText && (
          <Alert bsStyle="warning">{this.props.infoText}</Alert>
        )}
        <div className="form-group">
          <label className="control-label col-sm-3">
            Description
          </label>
          <div className="col-sm-9">
            <input
              className="form-control"
              type="text"
              name="authorizedFor"
              defaultValue={this.props.authorizedFor}
              onChange={(e) => this.props.onChangeFn('authorizedFor', e.target.value)}
              autoFocus={true}
              disabled={this.props.disabled}
            />
            <p className="help-block">
              Describe this authorization, e.g. by the account name.
            </p>
          </div>
        </div>
      </div>
    );
  }
});
