import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { AlertBlock, ExternalLink } from '@keboola/indigo-ui';
import oAuthMigration from '../../components/utils/oAuthMigration';
import {Button, Col, Row} from 'react-bootstrap';
import {Link} from 'react-router';
import ComponentName from '../../../react/common/ComponentName';

export default createReactClass({
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
      <AlertBlock type="warning" title="Please migrate these configurations to the new version of OAuth Broker">
        <p>
          We have released a new version of our OAuth Broker API. New features will be added 
          {' '}soon: automatic refreshing of tokens, multiple client apps for
          {' '}better quota management, and so on. Configurations requiring migration are listed below.
          {' '}
          <ExternalLink href="https://status.keboola.com/migrate-to-new-version-of-oauth-broker-api">
            Read more
          </ExternalLink>
        </p>
        <Row>
          {oauthConfigurations.entrySeq().map(([componentId, configurations]) => {
            const component = components.find(item => item.get('id') === componentId);
            return (
              <Col md={6} key={componentId}>
                <h4>
                  <ComponentName
                    component={component}
                    showType={true}
                  />
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
