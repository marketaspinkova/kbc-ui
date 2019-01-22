import React, {PropTypes} from 'react';
// import InstalledComponentsStore from '../../stores/InstalledComponentsStore';
import {AlertBlock} from '@keboola/indigo-ui';
import {Button, Col, Row} from 'react-bootstrap';
import {Link} from 'react-router/lib';
// import {Map} from 'immutable';
// import createStoreMixin from '../../../../react/mixins/createStoreMixin';
// import InstalledComponentsActions from '../../InstalledComponentsActionCreators';

const OAUTH_LATEST_VERSION = 3;

export default React.createClass({
  // mixins: [createStoreMixin(InstalledComponentsStore)],

  propTypes: {
    component: PropTypes.object.isRequired,
    configurations: PropTypes.object.isRequired
  },

  hasOldConfigurations() {
    let hasOldConfig = false;
    const configsData = this.props.configurations;
    configsData.forEach((configuration) => {
      console.log(configuration.toJS());

      hasOldConfig = !configuration.hasIn(['authorization', 'oauth_api', 'version'])
        || configuration.getIn(['authorization', 'oauth_api', 'version']) < OAUTH_LATEST_VERSION;
    });

    return hasOldConfig;
  },

  shouldDisplay() {
    return this.props.component.get('flags').contains('genericDockerUI-authorization')
     && this.hasOldConfigurations();
  },

  render() {
    if (!this.shouldDisplay()) {
      return null;
    }

    return this.renderInfoRow();
  },

  componentWillUnmount() {

  },

  renderInfoRow() {
    return (
      <AlertBlock type="warning" title="This component is using old version of OAuth Broker">
        <Row>
          <Col md={9}>
            {this.getInfo()}
            {this.renderMigrationButton()}
          </Col>
        </Row>
      </AlertBlock>
    );
  },

  getInfo() {
    return (
      <p>
        Please migrate all your configurations to the newest OAuth Broker version.
      </p>
    );
  },

  renderMigrationButton() {
    return (
      <Link to="migrations">
        <Button bsStyle="primary">
          Proceed to Migration
        </Button>
      </Link>
    );
  }
});
