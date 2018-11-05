# Convert `.coffee` to `.js(x)`

## Installation

Install new tools (or rebuild Docker image):

- [decaffeinate](https://github.com/decaffeinate/decaffeinate)
- [jscodeshift](https://github.com/facebook/jscodeshift)

```
yarn global add decaffeinate jscodeshift
```

Init/Update Git submodules

```
git submodule init
git submodule update
```
Optionally check [react-codemod](https://github.com/reactjs/react-codemod) and
[kbc-ui-codemode](https://github.com/keboola/kbc-ui-codemod) repositories.

## Run

### 1. Write test

This is optional, since Decaffeinate is pretty stable. But if you really need
tests, check out blog post about
[converting Coffeescript to JSX.](https://500.keboola.com/the-worry-free-way-to-convert-coffeescript-to-jsx-ad5fe3b1e8ba)
or look for other tests in a codebase (look for mocks, etc.).

### 2. Convert to `.js(x)` using `decaffeinate`

For converting files without React components this is probably the only step required.

```
decaffeinate --use-js-modules src/scripts/react/layout/project-select/List.coffee
```

This will create new file `src/scripts/react/layout/project-select/List.js` (check
its header for additional suggestions from Decaffeinate).

### 3. Replace direct React.DOM factories calls

Due to imports like `const {div, ul, li, a, span, input, i} = React.DOM;` we
cannot use `React-DOM-to-react-dom-factories` transform directly.

So we created custom transform which will convert calls like `div(..)` to
`React.DOM.div(...)`.

```
jscodeshift -t codemod/transforms/dom-factories-calls-to-calls-with-react-dom-prefix.js \
  src/scripts/react/layout/project-select/List.js
```

### 4. Replace React DOM with React DOM factories

```
jscodeshift -t react-codemod/transforms/React-DOM-to-react-dom-factories.js \
  src/scripts/react/layout/project-select/List.js
```

### 5. Make sure there are no React.createFactory

All components which were created using `React.createFactory` should be used using
`React.createElement`.

Convert from:

```js
Text = React.createFactory(require('./Text'));
Text();
```

To:

```js
Text = require('./Text');
React.createElement(Text)
```

### 6. Replace React.createElement with JSX syntax

```
jscodeshift -t react-codemod/transforms/create-element-to-jsx.js \
src/scripts/react/layout/project-select/List.js
```

### 7. Manually optimize

E.g.:

- remove implicit returns
- remove `displayName`, most of the time it's not needed (later we can add
transform for that too)
