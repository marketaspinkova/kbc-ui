React = require('react')
Immutable = require('immutable')

createStoreMixin = require '../../../../react/mixins/createStoreMixin'
ComponentsStore = require('../../../components/stores/ComponentsStore')
RedshiftSandboxCredentialsStore = require('../../../provisioning/stores/RedshiftSandboxCredentialsStore').default
CredentialsActionCreators = require('../../../provisioning/ActionCreators')
RedshiftCredentials = React.createFactory(require('../../../provisioning/react/components/RedshiftCredentials').default)
ConfigureSandbox = React.createFactory(require '../components/ConfigureSandbox')
RunComponentButton =
  React.createFactory(require '../../../components/react/components/RunComponentButton')
DeleteButton = React.createFactory(require('../../../../react/common/DeleteButton').default)
Loader = React.createFactory(require('@keboola/indigo-ui').Loader)
StorageBucketsStore = require '../../../components/stores/StorageBucketsStore'
StorageTablesStore = require '../../../components/stores/StorageTablesStore'
contactSupport = require('../../../../utils/contactSupport').default
Tooltip = React.createFactory(require('./../../../../react/common/Tooltip').default)
RedshiftSSLInfoModal = React.createFactory(require './RedshiftSSLInfoModal')
ApplicationStore = require '../../../../stores/ApplicationStore'

{div, span, input, strong, form, button, h3, h4, i, button, small, ul, li, a} = React.DOM
RedshiftSandbox = React.createClass

  mixins: [createStoreMixin(
    RedshiftSandboxCredentialsStore,
    StorageBucketsStore,
    StorageTablesStore
  )]

  displayName: 'RedshiftSandbox'

  getStateFromStores: ->
    credentials: RedshiftSandboxCredentialsStore.getCredentials()
    pendingActions: RedshiftSandboxCredentialsStore.getPendingActions()
    isLoading: RedshiftSandboxCredentialsStore.getIsLoading()
    isLoaded: RedshiftSandboxCredentialsStore.getIsLoaded()
    tables: StorageTablesStore.getAll()
    buckets: StorageBucketsStore.getAll()

  getInitialState: ->
    showSSLInfoModal: false
    sandboxConfiguration: Immutable.Map()

  _openSupportModal: (e) ->
    contactSupport(type: 'project')
    e.preventDefault()
    e.stopPropagation()

  _renderCredentials: ->
    span {},
      RedshiftCredentials {credentials: @state.credentials, isCreating: @state.pendingActions.get("create")}

  _renderControlButtons: ->
    if @state.credentials.get "id"
      component = @
      div {},
        div {},
          RunComponentButton(
            component: 'transformation'
            method: 'create-sandbox'
            title: "Load tables into Redshift sandbox"
            mode: 'button'
            label: "Load data"
            disabled: @state.pendingActions.size > 0
            runParams: ->
              component.state.sandboxConfiguration
            modalRunButtonDisabled: @state.sandboxConfiguration.get('include', Immutable.List()).size == 0
          ,
            ConfigureSandbox
              backend: 'redshift'
              tables: @state.tables
              buckets: @state.buckets
              onChange: (params) ->
                component.setState(
                  sandboxConfiguration: Immutable.fromJS(params)
                )
          )
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
          RedshiftSSLInfoModal {show: @state.showSSLInfoModal, onHide: @_hideSSLInfoModal}
        div {},
          DeleteButton
            tooltip: 'Delete Redshift Sandbox'
            isPending: @state.pendingActions.size > 0
            isEnabled: @state.pendingActions.size == 0
            pendingLabel: 'Deleting sandbox'
            label: 'Drop sandbox'
            fixedWidth: true
            confirm:
              title: 'Delete Redshift Sandbox'
              text: 'Do you really want to delete the Redshift sandbox?'
              onConfirm: @_dropCredentials
    else
      if !@state.pendingActions.get("create")
        button {className: 'btn btn-link', onClick: @_createCredentials},
          i className: 'fa fa-fw fa-plus'
          'New Sandbox'

  render: ->
    div {className: 'row'},
      div {className: 'col-xs-12'},
        h4 {}, 'Redshift'
      div {className: 'col-md-9'},
        @_renderCredentials()
      div {className: 'col-md-3'},
        @_renderControlButtons()


  _createCredentials: ->
    CredentialsActionCreators.createRedshiftSandboxCredentials()

  _dropCredentials: ->
    CredentialsActionCreators.dropRedshiftSandboxCredentials()

  _refreshCredentials: ->
    CredentialsActionCreators.refreshRedshiftSandboxCredentials()

  _showSSLInfoModal: ->
    @setState({showSSLInfoModal: true})

  _hideSSLInfoModal: ->
    @setState({showSSLInfoModal: false})


module.exports = RedshiftSandbox
