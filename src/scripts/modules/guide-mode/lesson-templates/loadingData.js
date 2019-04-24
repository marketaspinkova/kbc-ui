export default {
  'id': 2,
  'title': 'Loading Data',
  'steps': [
    {
      'id': 1,
      'position': 'center',
      'backdrop': true,
      'isNavigationVisible': false,
      'title': 'Introduction',
      'markdown': 'As promised in Lesson 1, you are about to build a simple workflow that analyzes data about **car ownership** stored in two database tables. In this lesson you will start by configuring an extractor to access the prepared tables in a sample database. You will then take the data in the tables and copy it into two new tables created for this purpose in Keboola Connection Storage.',
      'media': 'kbc_scheme_light_blue-ext.svg',
      'mediaType': 'img',
      'route': {
        'name': 'app',
        'params': []
      }
    }, {
      'id': 2,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Create Extractor',
      'markdown': 'Because both data tables are stored in a Snowflake database, you’ll be using the Snowflake extractor. By configuring it, you’ll specify what data to bring from the external database to your project and how.'
                + `
- Find **Snowflake**. You can use the search feature to find it quickly.
- Click on component and continue with <span class="btn btn-success btn-sm">+ New Configuration</span>.
- Name the configuration, e.g., _Guide extractor_, and click on <span class="btn btn-success btn-sm">Create Configuration</span>.

`,
      'media': '',
      'mediaType': '',
      'route': {
        'name': 'extractors',
        'params': []
      }
    }, {
      'id': 3,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Setup Connection',
      'markdown': 'To access the source database where the data about cars and countries is stored, provide database credentials:'
                + `
- Click on <span class="btn btn-success btn-sm">Setup Database Credentials</span>.
- Set Host Name to \`kebooladev.snowflakecomputing.com\`
- Set Port to \`443\`
- Set Username, Password, Database and Schema to \`HELP_TUTORIAL\`
- Set Warehouse to \`DEV\`
- Test the credentials and make sure to save them by clicking <span class="btn btn-success btn-sm">Save</span> in the upper right corner.
`,
      'media': '',
      'mediaType': '',
      'route': {
        'name': 'ex-db-generic-keboola.ex-db-snowflake-credentials',
        'params': [
          'config'
        ]
      }
    }, {
      'id': 4,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Select Tables',
      'markdown':
      'Once you have access to the database, it’s time to actually extract the data about the number of cars and population in different countries.'
      + `
- Select the tables *HELP_TUTORIAL.cars* and *HELP_TUTORIAL.countries* from the drop-down list on the left.
- Click <span class="btn btn-success btn-sm">Create</span>. Your extractor will be automatically configured.

`,
      'media': '',
      'mediaType': '',
      'route': {
        'name': 'keboola.ex-db-snowflake',
        'params': [
          'config'
        ]
      }
    },
    {
      'id': 5,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Run Extraction',
      'markdown': 'In the summary on the left, you can see what tables will be created in Storage once the extraction runs. They do not exist yet. <br/><br/> To create the new tables in your project, click <span class="btn btn-link btn-sm"> <i class="fa fa-play"></i> Run Extraction</span> on the right and wait for the orange indicator to turn green. Once it does, the extraction is finished. <br/><br/> Hover above the blue output table names to see that the tables are no longer empty. If you click the links, you will be able to see more details. <br/><br/> To continue, click <span class="btn btn-primary btn-sm">Next step <i class="fa fa-chevron-right"></i></span>.',
      'media': '',
      'route': {
        'name': 'keboola.ex-db-snowflake',
        'params': [
          'config'
        ]
      },
      'mediaType': ''
    }, {
      'id': 6,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Check Storage',
      'markdown': 'You can also check the results of your extraction directly in **Storage**. If you open the bucket **in.c-keboola-ex-db-snowflake** on the left, you will see both tables successfully extracted from the Snowflake database and loaded into Keboola Connection. <br/><br/> Click on the tables if you want to see more information about them, for example, a data sample.',
      'media': '',
      'mediaType': '',
      'route': {
        'name': 'storage-explorer',
        'params': []
      },
      'previousLink': 'extractors/keboola.ex-db-snowflake',
      'nextLink': ''
    }, {
      'id': 7,
      'position': 'center',
      'backdrop': true,
      'isNavigationVisible': false,
      'title': 'Learn More',
      'markdown': 'In this lesson, you extracted data from two tables from an external database, and imported the data to two new tables in your Keboola Connection project. To find out how you can work with the loaded data, continue to **Lesson 3 – Manipulating Data**. <br/><br/> Learn more about <a href="https://help.keboola.com/extractors/" target="_blank">Extractors</a>, or follow the hands-on tutorial on loading in our <a href="https://help.keboola.com/tutorial/load" target="_blank">user documentation</a>.',
      'route': {
        'name': 'app',
        'params': []
      }
    }
  ]
};
