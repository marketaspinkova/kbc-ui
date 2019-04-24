export default {
  'id': 1,
  'title': 'Basic Overview',
  'steps': [
    {
      'id': 1,
      'position': 'center',
      'backdrop': true,
      'isNavigationVisible': false,
      'title': 'Introduction',
      'markdown': 'This lesson gives you a basic overview of the Keboola Connection environment. Its interconnected components help you extract data from various sources, manipulate and enrich the data, write the results to visualizing tools of your choice, etc. In addition, the whole process can be fully automated.',
      'media': 'kbc_scheme_light_blue-gen.svg',
      'mediaType': 'img',
      'route': {
        'name': 'app',
        'params': []
      }
    },
    {
      'id': 2,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Extract data',
      'markdown': 'Every project in Keboola Connection starts by loading data. It is done with **Extractors** &ndash; components for importing data from your company’s internal databases, external sources, such as Facebook or YouTube, and from your own computer.',
      'media': 'kbc_scheme_light_blue-gen.svg',
      'mediaType': 'img',
      'route': {
        'name': 'extractors',
        'params': []
      }
    },
    {
      'id': 3,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Store data',
      'markdown': 'All data you upload to your project, as well as all the tables your project creates, are stored in **Storage**, where they can be accessed at any time. <br/><br/> Sorted into buckets, your tables can always be easily found.',
      'media': 'kbc_scheme_light_blue-gen.svg',
      'mediaType': 'img',
      'route': {
        'name': 'storage-explorer',
        'params': []
      },
      'previousLink': 'extractors',
      'nextLink': 'transformations'
    },
    {
      'id': 4,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Manipulate data',
      'markdown': 'Now it’s time to mix, clean and work with the extracted data. In **Transformations**, use your own script (SQL, Python, R or OpenRefine) for manipulation with the data. <br/><br/> Apart from Transformations, ready-to-use **Applications** created by Keboola or third parties are also available.',
      'media': 'kbc_scheme_light_blue-gen.svg',
      'mediaType': 'img',
      'route': {
        'name': 'transformations',
        'params': []
      }
    },
    {
      'id': 5,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Write results',
      'markdown': 'Once you’re happy with your results, let **Writers** deliver them to their final destination –  the systems and applications where the output data gets used or consumed, for instance, visualizing tools or databases.',
      'media': 'kbc_scheme_light_blue-gen.svg',
      'mediaType': 'img',
      'route': {
        'name': 'writers',
        'params': []
      }
    },
    {
      'id': 6,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Automate',
      'markdown': 'If you want to work with the latest data available, the whole sequence must be done over and over again. This is where full automation of your projects comes in. <br/><br/> **Orchestrations** allow you to specify at what time or how often your tasks should be executed and in what order.',
      'media': 'kbc_scheme_light_blue-gen.svg',
      'mediaType': 'img',
      'route': {
        'name': 'orchestrations',
        'params': []
      }

    },
    {
      'id': 7,
      'position': 'center',
      'backdrop': true,
      'isNavigationVisible': false,
      'title': 'Example Workflow',
      'markdown': 'Having learned all the basics, you can explore the individual steps in more detail in the lessons that follow. <br/><br/> After extracting data from two database tables, merging them into one table, and calculating some statistics, you will visualize the results. Finally, you will set up the whole process to run automatically. See our **example workflow** below.',
      'media': 'kbc_scheme_light_blue.svg',
      'mediaType': 'img',
      'route': {
        'name': 'app',
        'params': []
      }
    }
  ]
};
