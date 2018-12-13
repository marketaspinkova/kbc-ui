# Config Rows UI

Config Rows UI is a set of helpers to simply create a rich UI consistent with other components. All common features 
are taken care of, you only need to develop what's unique for your component. 

## Basic Principles

Config Rows UI employs hierarchical configurations. Each component can have any number of configurations and each 
configuration has any number of rows. The end user is allowed to run the whole configuration (all rows) or only 
a single row. 

This all is a logical wrapper - imagine a **configuration** being a database you want to connect to and a **row** a single 
table to be downloaded.  

### Structure

There is a common hierarchy and a fixed set of pages available

 - **Configuration detail**, also **index** - this is the main detail of the configuration where you set the credentials and other stuff 
 shared for all rows, it also contains a list of rows
 - **Configuration versions** - page of versions for the configuration
 - **Row detail**, also **row** - detail of a single row
 - **Row versions** - versions of a given row
   
Only the **Configuration detail** and **Row detail** pages are customizable.
 
### Sections
 
Each of the detail pages can contain multiple sections. Each section is a logical and visual container for a form 
or other ways of visualising a part of the component configuration.
 
### Adapters
 
The UI usually needs to display configuration in a different way than it is finally stored in Storage (eg. a set 
of processors triggered in a single checkbox). 
Adapters allow you to create a mapping between the physical storage and the best way to display the configuration.
This mapping is 2 way - so any change in the configuration will result in a change in the UI and vice versa.

The raw configuration (stored in Storage) is referred to as **configuration**, 
the mapped configuration is referred to as **local state**.

In case the user wants to modify the configuration further than the UI allows, the form can be switched to a JSON input 
without any constraints. Configurations, that cannot be mapped successfully to the local state, will remain as JSON. 
 

## Implementation

### Folder structure

The folder structure is very simple

```
routes.js 
adapters/*
react/components/*
```

- `routes.js` is the main configuration file
- `adapters/*` stores all adapters and their tests
- `react/components/*` stores all React components 
 
### `routes.js`

A sample `routes.js` file looks similar to this

```javascript
import createRoute from '../configurations/utils/createRoute';
import columnTypes from '../configurations/utils/columnTypeConstants';
import {
  createConfiguration as rowCreateConfiguration,
  parseConfiguration as rowParseConfiguration,
  createEmptyConfiguration as rowCreateEmptyConfiguration
} from './adapters/row';
import {
  createConfiguration as credentialsCreateConfiguration,
  parseConfiguration as credentialsParseConfiguration,
  isComplete as credentialsIsComplete
} from './adapters/credentials';
import ConfigurationForm from './react/components/Configuration';
import CredentialsForm from './react/components/Credentials';
import React from 'react';

const routeSettings = {
  componentId: 'keboola.ex-aws-s3',
  componentType: 'extractor',
  index: {
    sections: [
      {
          render: CredentialsForm,
          onSave: credentialsCreateConfiguration,
          onLoad: credentialsParseConfiguration
      }
    ]
  },
  row: {
    hasState: true,
    sections: [{
      render: ConfigurationForm,
      onSave: rowCreateConfiguration,
      onCreate: rowCreateEmptyConfiguration,
      onLoad: rowParseConfiguration
    }],
    columns: [
      {
        name: 'Name',
        type: columnTypes.VALUE,
        value: function(row) {
          return row.get('name') !== '' ? row.get('name') : 'Untitled';
        }
      },
      {
        name: 'Storage',
        type: columnTypes.TABLE_LINK_DEFAULT_BUCKET,
        value: function(row) {
          return row.get('tableName')
        }
      },
      {
        name: 'Description',
        type: columnTypes.VALUE,
        value: function(row) {
          return (
            <small>
              {row.get('description') !== '' ? row.get('description') : 'No description'}
            </small>
          );
        }
      }
    ]
  }
};

export default createRoute(routeSettings);

``` 

#### Parameters

- `componentId` - eg `vendor.ex-mycomponent`
- `componentType` - `extractor` or `writer`, `writer` will let the user select a table from Storage when creating a new row
- `index.sections` - sections on the **index** page
- `row.sections` - sections on the **row** page
- `row.hasState` - if the component saves state a button will show in the UI to reset the state
- `row.columns` - columns of the rows table on the **index** page
      
##### `index.sections`

Each section has the following properties
- `render` - React component to display this section
- `onSave` - adapter function mapping **local state** to **configuration**
- `onLoad` - adapter function mapping **configuration** to **local state** 
 
##### `row.sections`

##### `row.columns`

#### Helpers

##### `CreateCollapsibleSection`

##### `onConform`

### React Components


### Adapters

