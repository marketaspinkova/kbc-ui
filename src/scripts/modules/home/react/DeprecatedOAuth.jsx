import React, {PropTypes} from 'react';
import {AlertBlock} from '@keboola/indigo-ui';
import oAuthMigration from '../../components/utils/oAuthMigration';
import {Button, Col, Row} from 'react-bootstrap';
import {Link} from 'react-router';

export default React.createClass({
  propTypes: {
    components: PropTypes.object.isRequired
  },

  render() {
    const oauthConfigurations = this.props.components.map(
      component => oAuthMigration.getConfigurationsToMigrate(component)
    ).filter(component => !!component.count());

    const components = this.props.components;

    if (oauthConfigurations.isEmpty()) {
      return null;
    }

    return (
      <AlertBlock type="warning" title="Please migrate these configurations to a new version of OAuth Broker">
        <p>
          We have released new version of our OAuth Broker API. New features will soon be available in this new version like automatic refreshing of tokens, multiple client apps for better quota management and so on. All the configurations below will be migrated.
        </p>
        <Row>
          {oauthConfigurations.entrySeq().map(function([componentId, configurations]) {
            const component = components.find(item => item.get('id') === componentId);
            return (
              <Col md={6} key={componentId}>
                <h4>
                  {component.get('name')}
                </h4>
                <ul className="list-unstyled">
                  {configurations.map((configuration) => {
                    return (
                      <li key={configuration.get('id')}>
                        {configuration.get('name')}
                      </li>
                    );
                  }).toArray()}
                </ul>
              </Col>
            );
          })}
        </Row>
        <Link to="migrations">
          <Button bsStyle="primary">
            Proceed to Migration
          </Button>
        </Link>
      </AlertBlock>
    );
  }
});
