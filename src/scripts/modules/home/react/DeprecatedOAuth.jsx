import React, {PropTypes} from 'react';
import {AlertBlock} from '@keboola/indigo-ui';
import StringUtils from '../../../utils/string';
// import moment from 'moment';
import oAuthMigration from '../../components/utils/oAuthMigration';
import ComponentConfigurationLink from '../../components/react/components/ComponentConfigurationLink';
import descriptionExcerpt from '../../../utils/descriptionExcerpt';

export default React.createClass({
  propTypes: {
    components: PropTypes.object
  },

  render() {
    const oauthConfigurations = oAuthMigration.getConfigurationsFlatten(
      oAuthMigration.getComponentsToMigrate(this.props.components)
    );

    if (oauthConfigurations.isEmpty()) {
      return null;
    }

    const grouped = oauthConfigurations.groupBy(item => item.componentId);

    return (
      <AlertBlock type="warning" title="Project contains configurations with OAuth credentials that need to be migrated to new OAuth Broker version">
        <div className="row">
          {grouped.entrySeq().map(function([componentId, configurations]) {
            return (
              <div className="col-md-6" key={componentId}>
                <h4>
                  <span className={'kbc-' + componentId + '-icon'}/>
                  {StringUtils.capitalize(componentId)}s
                </h4>
                <ul className="list-unstyled">
                  {configurations.entrySeq().map(function([index, configuration]) {
                    return (
                      <li key={index}>
                        <ComponentConfigurationLink
                          configId={configuration.id}
                          componentId={configuration.componentId}
                        >
                          <span className="td">
                            <strong>{configuration.name}</strong>
                            <small>{descriptionExcerpt(configuration.description)}</small>
                          </span>

                          {/*
                           < component={configuration} />
                           {configuration.get('expiredOn') && (
                            <span>
                              {' '}(Deprecated in {moment(configuration.get('expiredOn')).format('MMM YYYY')})
                            </span>
                          )}
                           */}
                        </ComponentConfigurationLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </AlertBlock>
    );
  }
});
