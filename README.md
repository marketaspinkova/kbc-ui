# Keboola Connection UI

[![Build Status](https://travis-ci.org/keboola/kbc-ui.svg?branch=master)](https://travis-ci.org/keboola/kbc-ui)

User interface for Keboola Connection

## Development

* Make sure you have Node 8 installed (`node -v`)
* Clone this repository
* We are using [Yarn](https://yarnpkg.com/) instead of NPM.
  * It has many [advantages](https://medium.com/@nikjohn/facebooks-yarn-vs-npm-is-yarn-really-better-1890b3ea6515#.7p88qfh2o)
  * Choose [installation](https://yarnpkg.com/en/docs/install) option for your platform
* Install dependencies `yarn` (or `yarn install`)
* Serve, watch and test with live reload `yarn start`
* Open this url in your browser `https://localhost:3000/?token=YOUR_STORAGE_API_TOKEN`
  * By default UI is connected to `https://connection.keboola.com`.
  If you want to connect it to another host, you can use `host` parameter
  `https://localhost:3000/?token=YOUR_STORAGE_API_TOKEN&host=http://kbc.local`

Application will be opened in your browser and will be hot reloaded after each change in source files.

### Running in Docker

- Docker Engine and Docker Compose combination which supports Docker Compose file v2 is required
- Yarn is already installed (see `Dockerfile`)

Just run:

- `docker-compose run --rm --service-ports node`
- then `yarn` and `yarn start`
- open same URL as in section above

### Build dist package

* `yarn build` (`npm run build`) (It is executed by Travis after each push)

##  Application Architecture

 * Single page application running in browser data fetching from Keboola REST APIs.
 * Written in [ES2015](https://babeljs.io/docs/learn-es2015/) (ES6) compiled to JS using [Babel](https://babeljs.io/) (older parts are written in Coffeescript).
 * Bundled by [Webpack](https://webpack.github.io/).
 * View layer is composed by [React](http://facebook.github.io/react/) components
 * [Flux Architecture](https://facebook.github.io/flux/docs/overview.html) with unidirectional data flow controlling whole application. Vanilla Flux implementation is used.
 * [React Router](http://rackt.github.io/react-router/) for routing
 * [Keboola Bootstrap](https://github.com/keboola/kbc-bootstrap) for UI components style. It is based on [Twitter Bootstrap](http://getbootstrap.com/)

### React Components Best Practices

 * It has to be pure it means rendered result is dependent only on components `props` and `state`. [PureRenderer mixin](https://facebook.github.io/react/docs/pure-render-mixin.html) can be then utilized
 * Component props and state should be [Immutable](http://facebook.github.io/immutable-js/) structures
 * Define [Prop Types](https://facebook.github.io/react/docs/reusable-components.html#prop-validation) form component. It is validated in development runtime and also in build step using [ESlint](http://eslint.org/)
 * Separate component which involves some data fetching to container components holding the fetched state and simple component rendering the data received using `props`. [Read more about this pattern](https://medium.com/@learnreact/container-components-c0e67432e005)
   * Most of component should be "dumb" only with `props`, these are easiest to understand and most reusabled. Only top level components and container component should be connected to Flux stores. `state` can be of course used for things like open modal or acccordion status or temporary edit values in modal.
   * If you want to enhance component behaviour or inject some data consider using [High Order Components](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750) It allows great composability using  functions.

## UX Guidelines

 * Try to reuse components from [KBC Bootstrap](http://kbc-bootstrap-jakub-devel.keboola.com/examples/)
 * Provide instant feedback for all actions.
 * Provide confirmation and explanation for possibly destructive actions (delete configuration, run job)
 * UI should be self explainable and it should guide you to required actions. e.q. Database extractor configuration flow.
 * Data fetching
   * Render the page when the primary data are available.
   * Some additionally data can be fetched later, loader should be shown when data are not yet loaded.

## Code linting

We are using popular [Eslint](http://eslint.org/) with custom `.eslintrc` file

  * Linting is automatically run before test task
  * run `yarn lint` (`npm run lint`) - to run linting
  * run `yarn lint:fix` (`npm run lint:fix`) - to run linting with fixes (when fix is possible)
  * run `yarn lint[:fix] -- VersionsDiffModal` (`npm run lint[:fix] -- VersionsDiffModal`) - to run lint only on files with this pattern (it is pretty fuzzy, maybe will match more files then you expect)

## Tests

As runner we are using [Jest](https://facebook.github.io/jest/) library.
With [component snapshot testing](https://facebook.github.io/jest/blog/2016/07/27/jest-14.html) feature.
Some [story](https://hackernoon.com/testing-react-components-with-jest-and-enzyme-41d592c174f#.wxikmo1tn) about snapshot testing

  * run `yarn test` (`npm run test`) - it runs eslint and all tests
  * run `yarn jest` (`npm run jest`) - it runs just tests
  * run `yarn tdd` (`npm run tdd`) - it runs tests with watch and rerun on change
  * run `yarn jest:update` (`npm run jest:update`) - Updates snapshots (recommend to run it only with `-- TestName` to prevent overwriting other snapshots)
  * run `yarn jest[:update] -- VersionsDiffModal` (`npm run jest[:update]  -- VersionsDiffModal`) - for run tests only for particular files selected by regexp

## HOW TO

### Add assets

Whole application is bundled by Webpack, not just js files but also stylesheets (less, css), media and image files.
Assets should be loaded by `require` or `import` function.

**Examples:**

 * [CSS include](https://github.com/keboola/kbc-ui/blob/master/src/scripts/react/layout/App.jsx#L16)
 * [Image](https://github.com/keboola/kbc-ui/blob/master/src/scripts/react/common/JobStatusCircle.jsx#L5)
 * [mp3](https://github.com/keboola/kbc-ui/blob/master/src/scripts/utils/SoundNotifications.js#L3)


### Add New Component (extractor, writer or application)

  * Component has to be first registered in Keboola Connection
    * Ask someone from Keboola to register the component (there will be API one day)
    * Registered component is available in components list https://connection.keboola.com/v2/storage
    * During development component should have flag `excludeFromNewList`. The component will not be listed on New Extractor page.
    * Working backend is not required, we can register empty component
  * When the component is registered cached components list in ui should be updated
    * Copy content of `components` array and paste it to [index.html](https://github.com/keboola/kbc-ui/blob/77ab46b41a473cf3ad8bab01b807f9bf74d7da47/index.html#L21)
  * Create test configuration of your component
    * Use curl or some http client to trigger [Create Config API call](http://docs.keboola.apiary.io/#post-%2Fv2%2Fstorage%2Fcomponents%2F%7Bcomponent_id%7D%2Fconfigs)
    * cUrl example `curl -H "X-StorageApi-Token:YOUR_STORAGE_API_TOKEN" -d "name=My First Dropbox" https://connection.keboola.com/v2/storage/components/ex-dropbox/configs`
  * Create and register routes for new component
    * Components routes, you can just copy and modify `ex-adform` routes https://github.com/keboola/kbc-ui/blob/master/src/scripts/modules/ex-adform/routes.js
    * Register routes https://github.com/keboola/kbc-ui/blob/master/src/scripts/modules/components/Routes.js#L91
