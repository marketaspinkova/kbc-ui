import _ from 'underscore';
import ComponentsActionCreators from './modules/components/ComponentsActionCreators';
import ServicesActionCreators from './modules/services/ActionCreators';
import InstalledComponentsActionCreators from './modules/components/InstalledComponentsActionCreators';
import OrchestrationsActionCreators from './modules/orchestrations/ActionCreators';

export default initialData => {
  return _.forEach(initialData, (data, name) => {
    switch (name) {
      case 'components':
        return ComponentsActionCreators.receiveAllComponents(data);

      case 'services':
        return ServicesActionCreators.receive(data);

      case 'installedComponents':
        return InstalledComponentsActionCreators.receiveAllComponents(data);

      case 'orchestrations':
        return OrchestrationsActionCreators.receiveAllOrchestrations(data);

      default:
        break;
    }
  });
};
