React = require('react')
Immutable = require('immutable')

createStoreMixin = require '../../../../react/mixins/createStoreMixin'
SnowflakeSandboxCredentialsStore = require('../../../provisioning/stores/SnowflakeSandboxCredentialsStore')
SnowflakeCredentials = React.createFactory(
  require('../../../provisioning/react/components/SnowflakeCredentials').default
)
CredentialsActionCreators = require('../../../provisioning/ActionCreators')

{div, span, input, strong, form, button, h3, h4, i, button, small, ul, li, a} = React.DOM
SnowflakeCredentialsContainer = React.createClass

  mixins: [createStoreMixin(SnowflakeSandboxCredentialsStore)]

  displayName: 'SnowflakeCredentialsContainer'

  componentDidMount: ->
    if (!@state.credentials.get("id") && @props.isAutoLoad)
      CredentialsActionCreators.createSnowflakeSandboxCredentials()

  propTypes:
    isAutoLoad: React.PropTypes.bool.isRequired

  getStateFromStores: ->
    credentials: SnowflakeSandboxCredentialsStore.getCredentials()
    pendingActions: SnowflakeSandboxCredentialsStore.getPendingActions()
    isLoading: SnowflakeSandboxCredentialsStore.getIsLoading()
    isLoaded: SnowflakeSandboxCredentialsStore.getIsLoaded()

  render: ->
    SnowflakeCredentials {credentials: @state.credentials, isCreating: @state.pendingActions.get("create")}

module.exports = SnowflakeCredentialsContainer
