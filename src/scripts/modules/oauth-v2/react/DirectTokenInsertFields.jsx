import PropTypes from 'prop-types';
import React from 'react';
export default React.createClass({

  propTypes: {
    token: PropTypes.string.isRequired,
    authorizedFor: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    onChangeProperty: PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      token: '',
      authorizedFor: ''
    }
  },

  makeSetStatePropertyFn(prop) {
    return (e) => {
      const val = e.target.value;
      this.props.onChangeProperty(prop, val);
    };
  },

  render() {
    return (
      <div>
        <div className="form-group">
          <label className="control-label col-xs-3">
            Token
          </label>
          <div className="col-xs-9">
            <input
              className="form-control"
              type="text"
              name="directtoken"
              value={this.props.token}
              onChange={this.makeSetStatePropertyFn('token')}
              autoFocus={true}
            />
            <span className="help-block">
              Manually generated access token.
            </span>
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-3">
            Description
          </label>
          <div className="col-xs-9">
            <input
              className="form-control"
              type="text"
              name="directauthorizedFor"
              value={this.props.authorizedFor}
              onChange={this.makeSetStatePropertyFn('authorizedFor')}
              autoFocus={false}
            />
            <span className="help-block">
              Describe this authorization, e.g. by the account name.
            </span>
          </div>
        </div>
      </div>
    );
  }
});
