React = require('react')
Immutable = require('immutable')

createStoreMixin = require '../../../../react/mixins/createStoreMixin'
ComponentsStore = require('../../../components/stores/ComponentsStore')
MySqlSandboxCredentialsStore = require('../../../provisioning/stores/MySqlSandboxCredentialsStore').default
CredentialsActionCreators = require('../../../provisioning/ActionCreators')
MySqlCredentials = React.createFactory(require('../../../provisioning/react/components/MySqlCredentials').default)
ConfigureSandbox = React.createFactory(require '../components/ConfigureSandbox')
ConnectToMySqlSandbox = React.createFactory(require '../components/ConnectToMySqlSandbox')
RunComponentButton = React.createFactory(require '../../../components/react/components/RunComponentButton')
DeleteButton = React.createFactory(require('../../../../react/common/DeleteButton').default)
Loader = React.createFactory(require('@keboola/indigo-ui').Loader)
StorageBucketsStore = require '../../../components/stores/StorageBucketsStore'
StorageTablesStore = require '../../../components/stores/StorageTablesStore'
Tooltip = React.createFactory(require('./../../../../react/common/Tooltip').default)
MySqlSSLInfoModal = React.createFactory(require './MySqlSSLInfoModal')
ExtendMySqlCredentials = React.createFactory(require '../../../provisioning/react/components/ExtendMySqlCredentials')

{div, span, input, strong, form, button, h3, h4, i, button, small, ul, li, a} = React.DOM
MySqlSandbox = React.createClass

  mixins: [createStoreMixin(MySqlSandboxCredentialsStore, StorageTablesStore, StorageBucketsStore)]

  displayName: 'MySqlSandbox'

  getInitialState: ->
    showSSLInfoModal: false
    sandboxConfiguration: Immutable.Map()

  getStateFromStores: ->
    credentials: MySqlSandboxCredentialsStore.getCredentials()
    validUntil: MySqlSandboxCredentialsStore.getValidUntil()
    pendingActions: MySqlSandboxCredentialsStore.getPendingActions()
    isLoading: MySqlSandboxCredentialsStore.getIsLoading()
    isLoaded: MySqlSandboxCredentialsStore.getIsLoaded()
    tables: StorageTablesStore.getAll()
    buckets: StorageBucketsStore.getAll()

  _renderCredentials: ->
    span {},
      MySqlCredentials
        credentials: @state.credentials,
        validUntil: @state.validUntil,
        isCreating: @state.pendingActions.get("create")


  _renderControlButtons: ->
    if @state.credentials.get "id"
      component = @
      div {},
        div {},
          RunComponentButton(
            title: "Load tables into MySQL sandbox"
            component: 'transformation'
            method: 'create-sandbox'
            mode: 'button'
            label: "Load data"
            disabled: @state.pendingActions.size > 0
            runParams: ->
              component.state.sandboxConfiguration.toJS()
            modalRunButtonDisabled: @state.sandboxConfiguration.get('include', Immutable.List()).size == 0
          ,
            ConfigureSandbox
              backend: 'mysql'
              tables: @state.tables
              buckets: @state.buckets
              onChange: (params) ->
                component.setState(
                  sandboxConfiguration: Immutable.fromJS(params)
                )
          )
        div {},
          ConnectToMySqlSandbox {credentials: @state.credentials},
            button
              className: "btn btn-link"
              title: 'Connect To Sandbox'
              type: 'submit'
              disabled: @state.pendingActions.size > 0
            ,
              span {className: 'fa fa-fw fa-database'}
              " Connect"
        div {},
          Tooltip
            tooltip: 'Information about secure connection'
            id: 'ssl'
            placement: 'top'
          ,
            button
              className: "btn btn-link"
              onClick: @_showSSLInfoModal
              disabled: @state.pendingActions.size > 0
            ,
              span {className: 'fa fa-fw fa-lock '}
              " SSL"
          MySqlSSLInfoModal {show: @state.showSSLInfoModal, onHide: @_hideSSLInfoModal}
        div {},
          DeleteButton
            label: 'Drop sandbox'
            tooltip: 'Delete MySQL Sandbox'
            isPending: @state.pendingActions.get 'drop'
            fixedWidth: true
            isEnabled: @state.pendingActions.size == 0
            pendingLabel: 'Deleting sandbox'
            confirm:
              title: 'Delete MySQL Sandbox'
              text: 'Do you really want to delete the MySQL sandbox?'
              onConfirm: @_dropCredentials
        div {},
          ExtendMySqlCredentials null
    else
      if !@state.pendingActions.get("create")
        button {className: 'btn btn-link', onClick: @_createCredentials},
          i className: 'fa fa-fw fa-plus'
          'New Sandbox'

  render: ->
    div {className: 'row'},
      div {className: 'col-xs-12'},
        h4 {}, 'MySQL'
      div {className: 'col-md-9'},
        @_renderCredentials()
      div {className: 'col-md-3'},
         @_renderControlButtons()


  _createCredentials: ->
    CredentialsActionCreators.createMySqlSandboxCredentials()

  _dropCredentials: ->
    CredentialsActionCreators.dropMySqlSandboxCredentials()

  _showSSLInfoModal: ->
    @setState({showSSLInfoModal: true})

  _hideSSLInfoModal: ->
    @setState({showSSLInfoModal: false})

module.exports = MySqlSandbox
