React = require('react')
Immutable = require('immutable')

createStoreMixin = require '../../../../react/mixins/createStoreMixin'
MySqlSandboxCredentialsStore = require('../../../provisioning/stores/MySqlSandboxCredentialsStore').default
MySqlCredentials = React.createFactory(require('../../../provisioning/react/components/MySqlCredentials').default)
CredentialsActionCreators = require('../../../provisioning/ActionCreators')

{div, span, input, strong, form, button, h3, h4, i, button, small, ul, li, a} = React.DOM
MySqlCredentialsContainer = React.createClass

  mixins: [createStoreMixin(MySqlSandboxCredentialsStore)]

  displayName: 'MySqlCredentialsContainer'

  componentDidMount: ->
    if (!@state.credentials.get("id") && @props.isAutoLoad)
      CredentialsActionCreators.createMySqlSandboxCredentials()

  propTypes:
    isAutoLoad: React.PropTypes.bool.isRequired

  getStateFromStores: ->
    credentials: MySqlSandboxCredentialsStore.getCredentials()
    validUntil: MySqlSandboxCredentialsStore.getValidUntil()
    pendingActions: MySqlSandboxCredentialsStore.getPendingActions()
    isLoading: MySqlSandboxCredentialsStore.getIsLoading()
    isLoaded: MySqlSandboxCredentialsStore.getIsLoaded()

  render: ->
    MySqlCredentials
      credentials: @state.credentials
      validUntil: @state.validUntil
      isCreating: @state.pendingActions.get("create")
      hideClipboard: false

module.exports = MySqlCredentialsContainer
