export default {
  'id': 5,
  'title': 'Project Automation',
  'steps': [
    {
      'id': 1,
      'position': 'center',
      'backdrop': true,
      'isNavigationVisible': false,
      'title': 'Introduction',
      'markdown': 'To bring in the newest data available, the whole sequence of loading, transforming and writing must be done repeatedly. Keboola Connection Orchestrator does exactly that – automatically. <br/><br/> In this lesson, you will specify at what time or how often the tasks you configured in the previous lessons should be executed, and in what order. In addition, you will set up notifications that will be sent to you in case something goes wrong and requires your attention.',
      'route': {
        'name': 'app',
        'params': []
      }
    }, {
      'id': 2,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Create Orchestration',
      'markdown': 'To create the orchestration of your tasks, click <span class="btn btn-success btn-sm">+ New Orchestration</span>. Then type in the orchestration’s name, e.g., *Guide orchestration*, and click <span class="btn btn-success btn-sm">Create Orchestration</span>.',
      'route': {
        'name': 'orchestrations',
        'params': []
      }
    }, {
      'id': 3,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Orchestration Overview',
      'markdown': 'The orchestrator configuration consists of three separate parts in which you will create the desired **sequence** of the tasks you wish to execute. You will set your execution **schedule**, and select **notifications** you want to be sent to you in case of errors, delays, etc. <br/><br/> Start by clicking on <span class="btn btn-primary btn-sm"> <i class="fa fa-edit"></i> Configure Tasks</span> to select and order the tasks.',
      'media': '',
      'mediaType': '',
      'route': {
        'name': 'orchestration',
        'params': [
          'orchestrationId'
        ]
      }
    }, {
      'id': 4,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Configure Task',
      'markdown': 'As tasks, you will run the Snowflake extractor, transformation and Tableau writer configured in the previous lessons. Add the tasks one by one.'
                + `
- Click <span class="btn btn-success btn-sm">+ New task</span>, select the Snowflake extractor component, then select your configuration by clicking on <i class="fa fa-plus-circle"></i>. <br><br>
- Click <span class="btn btn-success btn-sm">+ New task</span> again. Select the Transformations component from the list, then select your configuration by clicking on <i class="fa fa-plus-circle"></i>. <br><br>
- Click <span class="btn btn-success btn-sm">+ New task</span> again. Select the Tableau writer component from the list, then select your configuration by clicking on <i class="fa fa-plus-circle"></i>. <br><br>

Then click <span class="btn btn-success btn-sm">Save</span> in the upper right corner.

`,
      'media': '',
      'mediaType': '',
      'route': {
        'name': 'orchestrationTasks',
        'params': [
          'orchestrationId'
        ]
      }
    }, {
      'id': 5,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Schedule Orchestration',
      'markdown': 'Now return to the orchestration overview and choose how often, on what days and at what time you want the configured tasks to run:' +
      `
- Click on the name of your orchestration in the top navigation (Orchestrations > **Guide orchestration** > Tasks). 
- Then click on <span class="btn btn-primary btn-sm"> <i class="fa fa-edit"></i> Edit schedule</span>.
- Choose whether you want to run the tasks every hour, every day, month, etc. Notice the generated **Next Schedules** below, telling you when the next orchestrations will run in your local time.
- Click on <span class="btn btn-success btn-sm">Save</span>.
      
      `,
      'media': '',
      'mediaType': '',
      'route': {
        'name': 'orchestration',
        'params': [
          'orchestrationId'
        ]
      }
    }, {
      'id': 6,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Configure Notifications',
      'markdown': 'Finally, to receive email notifications about errors, warnings and processing delays, enter the email address where you want notifications about your scheduled tasks to be sent.' +
      `
- Click on <span class="btn btn-primary btn-sm"> <i class="fa fa-edit"></i> Configure Notifications</span>.
- Then click on <span class="btn btn-success btn-sm">Edit Notifications</span> in the upper right corner.
- Add your email address for at least one notification type. You can add as many recipients as you want.
- Click on <span class="btn btn-success btn-sm">Save</span> in the upper right corner.

`,
      'media': '',
      'mediaType': '',
      'route': {
        'name': 'orchestration',
        'params': [
          'orchestrationId'
        ]
      }
    }, {
      'id': 7,
      'position': 'center',
      'backdrop': true,
      'isNavigationVisible': false,
      'title': 'Conclusion',
      'markdown': 'And that’s it! From data extraction to data writing, you have set up the full pipeline. Any change to your Snowflake database tables will be automatically reflected in your Tableau results. <br/><br/> Learn more about <a href="https://help.keboola.com/orchestrator/" target="_blank">Automation</a>, or follow the hands-on tutorial on automation in our <a href="https://help.keboola.com/tutorial/automate/" target="_blank">user documentation</a>. <br/><br/> Remember that no matter what problems you encounter while working with Keboola Connection, we will be more than happy to help you via our **Support**. There is <a href="https://help.keboola.com/" target="_blank">user documentation</a> written for you as well, covering every component of Keboola Connection.',
      'media': '',
      'mediaType': '',
      'route': {
        'name': 'orchestration',
        'params': [
          'orchestrationId'
        ]
      }
    },
    {
      'id': 8,
      'position': 'center',
      'backdrop': true,
      'isNavigationVisible': false,
      'title': 'Congratulations',
      'markdown': 'Congratulations! You have completed all lessons.',
      'media': 'keboola-finished.svg',
      'mediaType': 'img',
      'congratulations': true,
      'route': {
        'name': 'app',
        'params': []
      }
    }
  ]
};
