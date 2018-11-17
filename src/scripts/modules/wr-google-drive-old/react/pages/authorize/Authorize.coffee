React = require('react')
createStoreMixin = require('../../../../../react/mixins/createStoreMixin').default
WrGdriveStore = require '../../../wrGdriveStore'
ComponentsStore = require('../../../../components/stores/ComponentsStore').default
RoutesStore = require('../../../../../stores/RoutesStore').default
ApplicationStore = require('../../../../../stores/ApplicationStore').default
ActionCreators = require '../../../wrGdriveActionCreators'
AuthorizeAccount = React.createFactory(require('../../../../google-utils/react/AuthorizeAccount').default)

{div, span, form } = React.DOM

module.exports = React.createClass
  displayName: 'authorize'
  mixins: [createStoreMixin(WrGdriveStore)]

  getStateFromStores: ->
    configId = RoutesStore.getCurrentRouteParam('config')
    token = ApplicationStore.getSapiTokenString()

    gdriveComponent: ComponentsStore.getComponent('wr-google-drive')
    configId: configId
    token: token


  render: ->
    AuthorizeAccount
      componentName: 'wr-google-drive'
      refererUrl: @_getReferrer()
      isInstantOnly: true
      isGeneratingExtLink: false
      generateExternalLinkFn: ->
        false
      sendEmailFn: ->
        false

  _getReferrer: ->
    origin = window.location.origin
    basepath = ApplicationStore.getProjectPageUrl "writers/wr-google-drive"
    referrer = "#{origin}#{basepath}/#{@state.configId}"
    return referrer #encodeURIComponent(referrer)
