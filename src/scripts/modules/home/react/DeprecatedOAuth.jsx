import React, {PropTypes} from 'react';
import {AlertBlock} from '@keboola/indigo-ui';
import StringUtils from '../../../utils/string';
import oAuthMigration from '../../components/utils/oAuthMigration';
import {Button, Col, Row} from 'react-bootstrap';
import {Link} from 'react-router';

export default React.createClass({
  propTypes: {
    components: PropTypes.object
  },

  render() {
    const oauthConfigurations = this.props.components.map(
      component => oAuthMigration.getConfigurationsToMigrate(component)
    ).filter(component => !!component.count());

    return !oauthConfigurations.isEmpty() && (
      <AlertBlock type="warning" title="Please migrate these configurations to a new version of OAuth Broker">
        <p>
          We have released new version of our OAuth Broker API. New features will soon be available in this new version like automatic refreshing of tokens, multiple client apps for better quota management and so on. All the configurations below will be migrated.
        </p>
        <Row>
          {oauthConfigurations.entrySeq().map(function([componentId, configurations]) {
            return (
              <Col md={6} key={componentId}>
                <h4>
                  <span className={'kbc-' + componentId + '-icon'}/>
                  {StringUtils.capitalize(componentId)}
                </h4>
                <ul className="list-unstyled">
                  {configurations.map((configuration) => {
                    return (
                      <li key={configuration.get('id')}>
                        {configuration.get('name')}
                      </li>
                    );
                  })}
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
