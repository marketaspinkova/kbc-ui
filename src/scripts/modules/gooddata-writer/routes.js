import actionCreators from './actionCreators';
import InstalledComponentsStore from '../components/stores/InstalledComponentsStore';
import GoodDataWriterStore from './store';

import IndexPage from './react/pages/index/Index';
import TablePage from './react/pages/table/Table';
import WriterReloader from './react/components/WritersReloaderButton';
import TablePageHeaderButtons from './react/components/TableHeaderButtons';
import TablePageHeaderExportStatus from './react/components/TableHeaderExportStatus';
import DateDimensionsPage from './react/pages/date-dimensions/DateDimensions';
import ModelPage from './react/pages/model/Model';
import storageActionCreators from '../components/StorageActionCreators';
import JobsActionCreators from '../jobs/ActionCreators';
import VersionsActionCreators from '../components/VersionsActionCreators';
import { createTablesRoute } from '../table-browser/routes';

const componentId = 'gooddata-writer';

export default {
  name: componentId,
  path: ':config',
  isComponent: true,
  requireData: [
    (params) => actionCreators.loadConfiguration(params.config),
    () => storageActionCreators.loadTables(),
    (params) => VersionsActionCreators.loadVersions(componentId, params.config)
  ],
  poll: {
    interval: 15,
    action: (params) => {
      JobsActionCreators.loadComponentConfigurationLatestJobs(componentId, params.config);
      VersionsActionCreators.reloadVersions(componentId, params.config);
    }
  },
  defaultRouteHandler: IndexPage,
  reloaderHandler: WriterReloader,
  title(routerState) {
    const configId = routerState.getIn(['params', 'config']);
    return InstalledComponentsStore.getConfig(componentId, configId).get('name');
  },
  childRoutes: [
    createTablesRoute(componentId),
    {
      name: `${componentId}-table`,
      path: 'table/:table',
      requireData: [
        (params) => actionCreators.loadTableDetail(params.config, params.table),
        (params) => actionCreators.loadReferencableTables(params.config)
      ],
      title(routerState) {
        const configId = routerState.getIn(['params', 'config']);
        const tableId = routerState.getIn(['params', 'table']);
        const table = GoodDataWriterStore.getTable(configId, tableId);
        return `table ${table.get('id')}`;
      },
      handler: TablePage,
      headerButtonsHandler: TablePageHeaderButtons,
      reloaderHandler: TablePageHeaderExportStatus
    },
    {
      name: `${componentId}-date-dimensions`,
      path: 'dimensions',
      title() {
        return 'Date dimensions';
      },
      requireData: [(params) => actionCreators.loadDateDimensions(params.config)],
      handler: DateDimensionsPage
    },
    {
      name: `${componentId}-model`,
      path: 'model',
      title: 'Model',
      handler: ModelPage
    }
  ]
};
