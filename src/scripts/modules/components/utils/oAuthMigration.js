const ignoreComponents = [
  'esnerda.wr-zoho-crm',
  'keboola.ex-github',
  'esnerda.ex-twitter-ads',
  'tde-exporter'
];

export default {
  getConfigurationsToMigrate(component) {
    return component.get('configurations')
      .filter((config) => {
        return (config.hasIn(['configuration', 'authorization', 'oauth_api', 'id']) &&
                config.getIn(['configuration', 'authorization', 'oauth_api', 'version']) !== 3 ||
                (config.getIn(['configuration', 'parameters', 'keboola.wr-google-drive', 'version']) !== 3 &&
                config.getIn(['configuration', 'parameters', 'keboola.wr-dropbox-v2', 'version']) !== 3)
        );
      });
  },

  getComponentsToMigrate(components) {
    return components.filter(component => !ignoreComponents.includes(component.get('id')));
  },

  getIgnoredComponents(components) {
    return components.filter(component => ignoreComponents.includes(component.get('id')));
  },

  getConfigurationsFlatten(components) {
    return components.map(component => {
      return this.getConfigurationsToMigrate(component)
        .map(config => ({
          id: config.get('id'),
          componentId: component.get('id'),
          oauthId: config.getIn(['configuration', 'authorization', 'oauth_api', 'id'])
        }));
    }).flatten(1);
  }
};
