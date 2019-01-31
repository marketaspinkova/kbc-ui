import React, {PropTypes} from 'react';
import {AlertBlock} from '@keboola/indigo-ui';
import oAuthMigration from '../../components/utils/oAuthMigration';
import {Button, Col, Row} from 'react-bootstrap';
import {Link} from 'react-router';
import ComponentName from '../../../react/common/ComponentName';

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
          We have released new version of our OAuth Broker API. New features will soon be available in this new version like automatic refreshing of tokens, multiple client apps for better quota management and so on. Configurations requiring migration are listed below.
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
