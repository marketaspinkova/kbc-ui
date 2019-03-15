import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import { Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    isEditing: PropTypes.bool.isRequired,
    hasOffset: PropTypes.bool.isRequired,
    testCredentialsFn: PropTypes.func.isRequired,
    disabled: PropTypes.bool
  },

  getDefaultProps() {
    return {
      disabled: false,
      hasOffset: true
    };
  },

  getInitialState() {
    return {
      isTesting: false,
      isError: false,
      result: null
    };
  },

  _startTesting() {
    this.setState({
      isTesting: true,
      isError: false,
      result: null
    });

    return this.props.testCredentialsFn().then(this._onTestingDone, this._onTestingError);
  },

  _onTestingDone(result) {
    return this.setState({
      isTesting: false,
      isError: false,
      result
    });
  },

  _onTestingError(result) {
    return this.setState({
      isTesting: false,
      isError: true,
      result
    });
  },

  render() {
    return (
      <div className="kbc-inner-padding">
        <div className="form-group">
          <div className={classnames({ 'col-xs-8 col-xs-offset-4': this.props.hasOffset })}>
            <div>
              <Button
                bsStyle="primary"
                disabled={this.state.isTesting || this.props.disabled}
                onClick={this._startTesting}
              >
                Test Credentials
              </Button>
            </div>
            <div className="TestCredentialsButtonGroup-result">
              {this.state.isTesting && (
                <span>
                  <Loader /> Connecting ...
                </span>
              )}
              {(this.state.result || this.state.isError) && (
                ['success', 'ok'].includes(this.state.result.status) && !this.state.isError
                  ? this._testSuccess()
                  : this._testError(this.state.result)
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },

  _testSuccess() {
    return (
      <span className="text-success">
        <span className="fa fa-fw fa-check" />
        {' Connected! '}
        {this.props.isEditing && "Don't forget to save the credentials."}
      </span>
    );
  },

  _testError(result) {
    return (
      <span className="text-danger">
        <span className="fa fa-fw fa-meh-o" />
        {' Failed to connect! '}
        {result && (
          <div>
            <small>
              {result.message} {result.exceptionId}
            </small>
          </div>
        )}
      </span>
    );
  }
});
