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

export default {
  name: 'gooddata-writer',
  path: ':config',
  isComponent: true,
  requireData: [
    (params) => actionCreators.loadConfiguration(params.config),
    () => storageActionCreators.loadTables(),
    (params) => VersionsActionCreators.loadVersions('gooddata-writer', params.config)
  ],
  poll: {
    interval: 5,
    action(params) {
      return JobsActionCreators.loadComponentConfigurationLatestJobs(
        'gooddata-writer',
        params.config
      );
    }
  },

  defaultRouteHandler: IndexPage,
  reloaderHandler: WriterReloader,
  title(routerState) {
    const configId = routerState.getIn(['params', 'config']);
    return InstalledComponentsStore.getConfig('gooddata-writer', configId).get('name');
  },
  childRoutes: [
    {
      name: 'gooddata-writer-table',
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
      name: 'gooddata-writer-date-dimensions',
      path: 'dimensions',
      title() {
        return 'Date dimensions';
      },
      requireData: [(params) => actionCreators.loadDateDimensions(params.config)],
      handler: DateDimensionsPage
    },
    {
      name: 'gooddata-writer-model',
      path: 'model',
      title: 'Model',
      handler: ModelPage
    }
  ]
};
