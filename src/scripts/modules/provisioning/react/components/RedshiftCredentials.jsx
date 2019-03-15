import PropTypes from 'prop-types';
import React from 'react';
import { Protected, Loader, ExternalLink } from '@keboola/indigo-ui';
import { Col, FormGroup, Checkbox } from 'react-bootstrap';
import Clipboard from '../../../../react/common/Clipboard';

export default React.createClass({
  propTypes: {
    credentials: PropTypes.object,
    isCreating: PropTypes.bool
  },

  getInitialState() {
    return { showDetails: false };
  },

  render() {
    return <div>{this._renderSandbox()}</div>;
  },

  _renderSandbox() {
    if (this.props.isCreating) {
      return (
        <span>
          <Loader />
          &nbsp;Creating sandbox
        </span>
      );
    }

    if (this.props.credentials.get('id')) {
      return this._renderCredentials();
    }

    return 'Sandbox not running';
  },

  _renderCredentials() {
    const { credentials } = this.props;
    const jdbcRedshift = `jdbc:redshift://${credentials.get('hostname')}:5439/${credentials.get('db')}`;
    const jdbcPgSql = `jdbc:postgresql://${credentials.get('hostname')}:5439/${credentials.get('db')}`;

    return (
      <div>
        <p className="small">
          {'Use these credentials to connect to the sandbox with your favourite Redshift client (we like '}
          <ExternalLink href="http://dbeaver.jkiss.org/download/">DBeaver</ExternalLink>
          ).
        </p>
        <div className="row">
          <span className="col-md-3">Host</span>
          <span className="col-md-9">
            {this.props.credentials.get('hostname')}
            <Clipboard text={credentials.get('hostname')} />
          </span>
        </div>
        <div className="row">
          <span className="col-md-3">Port</span>
          <span className="col-md-9">
            5439
            <Clipboard text="5439" />
          </span>
        </div>
        <div className="row">
          <span className="col-md-3">User</span>
          <span className="col-md-9">
            {credentials.get('user')}
            <Clipboard text={credentials.get('user')} />
          </span>
        </div>
        <div className="row">
          <span className="col-md-3">Password</span>
          <span className="col-md-9">
            <Protected>{credentials.get('password')}</Protected>
            <Clipboard text={credentials.get('password')} />
          </span>
        </div>
        <div className="row">
          <span className="col-md-3">Database</span>
          <span className="col-md-9">
            {credentials.get('db')}
            <Clipboard text={credentials.get('db')} />
          </span>
        </div>
        <div className="row">
          <span className="col-md-3">Schema</span>
          <span className="col-md-9">
            {credentials.get('schema')}
            <Clipboard text={credentials.get('schema')} />
          </span>
        </div>
        <div className="form-horizontal clearfix">
          <div className="row">
            <div className="form-group-sm">
              <FormGroup>
                <Col md={9} mdOffset={3}>
                  <Checkbox
                    checked={this.state.showDetails}
                    onChange={this._handleToggleShowDetails}
                  >
                    <small>Show JDBC strings</small>
                  </Checkbox>
                </Col>
              </FormGroup>
            </div>
          </div>
        </div>

        {this.state.showDetails && (
          <div className="row">
            <span className="col-md-3">Redshift driver</span>
            <span className="col-md-9">
              {jdbcRedshift}
              <Clipboard text={jdbcRedshift} />
            </span>
          </div>
        )}

        {this.state.showDetails && (
          <div className="row">
            <span className="col-md-3">PostgreSQL driver</span>
            <span className="col-md-9">
              {jdbcPgSql}
              <Clipboard text={jdbcPgSql} />
            </span>
          </div>
        )}
      </div>
    );
  },

  _handleToggleShowDetails(e) {
    return this.setState({
      showDetails: e.target.checked
    });
  }
});
