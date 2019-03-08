import injectProps from './react/injectProps';
import ComponentsIndex from './react/pages/ComponentsIndex';
import NewComponent from './react/pages/NewComponent';
import ComponentReloaderButton from './react/components/ComponentsReloaderButton';
import ComponentsHeaderButtons from './react/components/ComponentsHeaderButtons';
import InstalledComponentsActionsCreators from './InstalledComponentsActionCreators';
import exApifyRoutes from '../apify/routes';
import exDbGenericRoutes from '../ex-db-generic/routes';
import exMongoDbRoutes from '../ex-mongodb/routes';
import exGoogleBigqueryRoutes from '../ex-google-bigquery/routes';
import exGoogleBigqueryV2Routes from '../ex-google-bigquery-v2/routes';
import exGaV4Routes from '../ex-google-analytics-v4/routes';
import exFacebookRoutes from '../ex-facebook/routes.js';
import exGdriveNewRoutes from '../ex-google-drive/routes';
import csvImportRoutes from '../csv-import/routes';
import exS3Routes from '../ex-s3/routes';
import exAwsS3Routes from '../ex-aws-s3/routes';
import exHttpRoutes from '../ex-http/routes';
import appSnowflakeDwhManagerRoutes from '../app-snowflake-dwh-manager/routes';
import goodDataWriterRoutes from '../gooddata-writer/routes';
import dropoxExtractorRoutesV2 from '../ex-dropbox-v2/routes';
import emailAttachmentsExtractorRoutes from '../ex-email-attachments/routes';
import createDbWriterRoutes from '../wr-db/routes';
import createGenericDetailRoute from './createGenericDetailRoute';
import createComponentRoute from './createComponentRoute';
import googleDriveWriterNewRoutes from '../wr-google-drive/routes';
import googleSheetsWriterRoutes from '../wr-google-sheets/routes';
import tdeRoutes from '../tde-exporter/tdeRoutes';
import adformRoutes from '../ex-adform/routes';
import twitterRoutes from '../ex-twitter/routes';
import geneeaGeneralRoutes from '../app-geneea-nlp-analysis/routes';
import geneeaV2Routes from '../geneea-nlp-analysis-v2/routes';
import customScienceRoutes from '../custom-science/Routes';
import gooddataWriterV3Routes from '../gooddata-writer-v3/routes';
import wrStorageRoutes from '../wr-storage/routes';
import exStorageRoutes from '../ex-storage/routes';
import wrAwsS3Routes from '../wr-aws-s3/routes';
import wrGoogleBigQueryRoutes from '../wr-google-bigquery/routes';
import wrGoogleBigQueryV2Routes from '../wr-google-bigquery-v2/routes';
import htnsExSalesforceRoutes from '../htns.ex-salesforce/routes';
import exFtpRoutes from '../ex-ftp/routes';
const extractor = injectProps({ type: 'extractor' });
const writer = injectProps({ type: 'writer' });
const application = injectProps({ type: 'application' });

const applications = {
  name: 'applications',
  title: 'Applications',
  requireData: function() {
    return InstalledComponentsActionsCreators.loadComponents();
  },
  defaultRouteHandler: application(ComponentsIndex),
  headerButtonsHandler: injectProps({
    addRoute: 'new-application',
    type: 'application'
  })(ComponentsHeaderButtons),
  reloaderHandler: ComponentReloaderButton,
  childRoutes: [
    {
      name: 'new-application',
      title: 'New Application',
      defaultRouteHandler: application(NewComponent)
    },
    createComponentRoute('geneea-nlp-analysis', [geneeaGeneralRoutes]),
    createComponentRoute('geneea.nlp-analysis-v2', [geneeaV2Routes]),
    createComponentRoute('custom-science', [customScienceRoutes]),
    createComponentRoute('keboola.app-snowflake-dwh-manager', [appSnowflakeDwhManagerRoutes]),
    createGenericDetailRoute('application')
  ]
};

const extractors = {
  name: 'extractors',
  title: 'Extractors',
  requireData: function() {
    return InstalledComponentsActionsCreators.loadComponents();
  },
  defaultRouteHandler: extractor(ComponentsIndex),
  headerButtonsHandler: injectProps({
    addRoute: 'new-extractor',
    type: 'extractor'
  })(ComponentsHeaderButtons),
  reloaderHandler: ComponentReloaderButton,
  childRoutes: [
    {
      name: 'new-extractor',
      title: 'New Extractor',
      defaultRouteHandler: extractor(NewComponent)
    },
    createComponentRoute('keboola.ex-google-analytics-v5', [exGaV4Routes('keboola.ex-google-analytics-v5')]),
    createComponentRoute('keboola.ex-google-analytics-v4', [exGaV4Routes('keboola.ex-google-analytics-v4')]),
    createComponentRoute('keboola.ex-google-analytics', [exGaV4Routes('keboola.ex-google-analytics')]),
    createComponentRoute('keboola.ex-facebook', [exFacebookRoutes('keboola.ex-facebook')]),
    createComponentRoute('keboola.ex-facebook-ads', [exFacebookRoutes('keboola.ex-facebook-ads')]),
    createComponentRoute('keboola.ex-instagram', [exFacebookRoutes('keboola.ex-instagram')]),
    createComponentRoute('keboola.ex-google-drive', [exGdriveNewRoutes]),
    createComponentRoute('ex-adform', [adformRoutes]),
    createComponentRoute('keboola.ex-twitter', [twitterRoutes]),
    createComponentRoute('radektomasek.ex-dropbox-v2', [dropoxExtractorRoutesV2]),
    createComponentRoute('keboola.ex-db-pgsql', [exDbGenericRoutes('keboola.ex-db-pgsql')]),
    createComponentRoute('keboola.ex-db-redshift', [exDbGenericRoutes('keboola.ex-db-redshift')]),
    createComponentRoute('keboola.ex-db-redshift-cursors', [exDbGenericRoutes('keboola.ex-db-redshift-cursors')]),
    createComponentRoute('keboola.ex-db-firebird', [exDbGenericRoutes('keboola.ex-db-firebird')]),
    createComponentRoute('keboola.ex-db-db2', [exDbGenericRoutes('keboola.ex-db-db2')]),
    createComponentRoute('keboola.ex-db-db2-bata', [exDbGenericRoutes('keboola.ex-db-db2-bata')]),
    createComponentRoute('keboola.ex-db-mssql', [exDbGenericRoutes('keboola.ex-db-mssql')]),
    createComponentRoute('keboola.ex-db-mysql', [exDbGenericRoutes('keboola.ex-db-mysql')]),
    createComponentRoute('keboola.ex-db-mysql-custom', [exDbGenericRoutes('keboola.ex-db-mysql-custom')]),
    createComponentRoute('keboola.ex-db-oracle', [exDbGenericRoutes('keboola.ex-db-oracle')]),
    createComponentRoute('keboola.ex-db-snowflake', [exDbGenericRoutes('keboola.ex-db-snowflake')]),
    createComponentRoute('keboola.ex-db-impala', [exDbGenericRoutes('keboola.ex-db-impala')]),
    createComponentRoute('keboola.ex-mongodb', [exMongoDbRoutes]),
    createComponentRoute('keboola.ex-google-bigquery', [exGoogleBigqueryRoutes]),
    createComponentRoute('keboola.ex-teradata', [exDbGenericRoutes('keboola.ex-teradata')]),
    createComponentRoute('keboola.csv-import', [csvImportRoutes]),
    createComponentRoute('keboola.ex-s3', [exS3Routes]),
    createComponentRoute('apify.apify', [exApifyRoutes]),
    createComponentRoute('keboola.ex-aws-s3', [exAwsS3Routes]),
    createComponentRoute('keboola.ex-email-attachments', [emailAttachmentsExtractorRoutes]),
    createComponentRoute('keboola.ex-http', [exHttpRoutes]),
    createComponentRoute('keboola.ex-storage', [exStorageRoutes]),
    createComponentRoute('htns.ex-salesforce', [htnsExSalesforceRoutes]),
    createComponentRoute('keboola.ex-ftp', [exFtpRoutes]),
    createComponentRoute('keboola.ex-google-bigquery-v2', [exGoogleBigqueryV2Routes]),
    createGenericDetailRoute('extractor')
  ]
};

const writers = {
  name: 'writers',
  title: 'Writers',
  requireData: function() {
    return InstalledComponentsActionsCreators.loadComponents();
  },
  defaultRouteHandler: writer(ComponentsIndex),
  headerButtonsHandler: injectProps({
    addRoute: 'new-writer',
    type: 'writer'
  })(ComponentsHeaderButtons),
  reloaderHandler: ComponentReloaderButton,
  childRoutes: [
    {
      name: 'new-writer',
      title: 'New Writer',
      defaultRouteHandler: writer(NewComponent)
    },
    createComponentRoute('gooddata-writer', [goodDataWriterRoutes]),
    createComponentRoute('tde-exporter', [tdeRoutes]),
    createComponentRoute('keboola.wr-google-sheets', [googleSheetsWriterRoutes]),
    createComponentRoute('keboola.wr-google-drive', [googleDriveWriterNewRoutes]),
    createComponentRoute('wr-db', [createDbWriterRoutes('wr-db', 'mysql', false)]),
    createComponentRoute('wr-db-mysql', [createDbWriterRoutes('wr-db-mysql', 'mysql', false)]),
    createComponentRoute('wr-db-oracle', [createDbWriterRoutes('wr-db-oracle', 'oracle', false)]),
    createComponentRoute('wr-db-redshift', [createDbWriterRoutes('wr-db-redshift', 'redshift', true)]),
    createComponentRoute('keboola.wr-looker', [createDbWriterRoutes('keboola.wr-looker', 'redshift', true)]),
    createComponentRoute('keboola.wr-qlik', [createDbWriterRoutes('keboola.wr-qlik', 'redshift', true)]),
    createComponentRoute('wr-tableau', [createDbWriterRoutes('wr-tableau', 'mysql', false)]),
    createComponentRoute('wr-db-mssql', [createDbWriterRoutes('wr-db-mssql', 'mssql', false)]),
    createComponentRoute('keboola.wr-db-mssql-v2', [createDbWriterRoutes('keboola.wr-db-mssql-v2', 'mssql', false)]),
    createComponentRoute('keboola.wr-redshift-v2', [
      createDbWriterRoutes('keboola.wr-redshift-v2', 'redshift', true)
    ]),
    createComponentRoute('keboola.wr-db-impala', [createDbWriterRoutes('keboola.wr-db-impala', 'impala', false)]),
    createComponentRoute('keboola.wr-db-mysql', [createDbWriterRoutes('keboola.wr-db-mysql', 'mysql', false)]),
    createComponentRoute('keboola.wr-db-oracle', [createDbWriterRoutes('keboola.wr-db-oracle', 'oracle', false)]),
    createComponentRoute('keboola.wr-db-pgsql', [createDbWriterRoutes('keboola.wr-db-pgsql', 'pgsql', false)]),
    createComponentRoute('keboola.wr-db-snowflake', [
      createDbWriterRoutes('keboola.wr-db-snowflake', 'snowflake', true)
    ]),
    createComponentRoute('keboola.wr-thoughtspot', [
      createDbWriterRoutes('keboola.wr-thoughtspot', 'thoughtspot', false)
    ]),
    createComponentRoute('keboola.gooddata-writer', [gooddataWriterV3Routes]),
    createComponentRoute('keboola.wr-storage', [wrStorageRoutes]),
    createComponentRoute('keboola.wr-aws-s3', [wrAwsS3Routes]),
    createComponentRoute('keboola.wr-google-bigquery', [wrGoogleBigQueryRoutes]),
    createComponentRoute('keboola.wr-google-bigquery-v2', [wrGoogleBigQueryV2Routes]),
    createGenericDetailRoute('writer')
  ]
};

export {
  applications,
  extractors,
  writers
};
