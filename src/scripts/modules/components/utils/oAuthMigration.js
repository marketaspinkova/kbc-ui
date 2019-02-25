const ignoreComponents = [
  'esnerda.wr-zoho-crm',
  'keboola.ex-github',
  'esnerda.ex-twitter-ads',
  'tde-exporter'
];

function needTdeExporterDestinationNewOauth(config, destinationComponentId) {
  const path = ['configuration', 'parameters', destinationComponentId];
  return config.hasIn(path) && config.getIn(path.concat('version')) !== 3;
}

export default {
  getConfigurationsToMigrate(component) {
    const isTdeExporter = component.get('id') === 'tde-exporter';
    return component.get('configurations')
      .filter((config) => {
        return (
          config.hasIn(['configuration', 'authorization', 'oauth_api', 'id'])
          && config.getIn(['configuration', 'authorization', 'oauth_api', 'version']) !== 3
          || (isTdeExporter && (
            needTdeExporterDestinationNewOauth(config, 'keboola.wr-google-drive')
            || needTdeExporterDestinationNewOauth(config, 'keboola.wr-dropbox-v2')
          ))
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
