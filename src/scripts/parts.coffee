###
  Entry point for non app pages, provides some basic parts implemented in React
###

require './utils/react-shim'

module.exports =
  helpers: require './helpers'
  parts:
    ProjectSelect: require('./react/layout/project-select/ProjectSelect').default
    GuideMode:
      Wizard: require('./modules/guide-mode/react/Wizard').default
    CurrentUser: require('./react/layout/CurrentUser').default
    ProjectsList: require('./react/layout/project-select/List').default
    NewProjectModal: require './react/layout/NewProjectModal'
