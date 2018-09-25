React = require 'react'
Immutable = require 'immutable'

createStoreMixin = require '../../../../../react/mixins/createStoreMixin'

OrchestrationsActionCreators = require '../../../ActionCreators'
OrchestrationStore = require '../../../stores/OrchestrationsStore'

OrchestrationRow = React.createFactory(require './OrchestrationRow')
SearchBar = React.createFactory(require('@keboola/indigo-ui').SearchBar)
RefreshIcon = React.createFactory(require('@keboola/indigo-ui').RefreshIcon)
ImmutableRendererMixin = require 'react-immutable-render-mixin'

NewOrchestrationButton = require '../../components/NewOrchestionButton'


{div, span, strong, h2, p} = React.DOM

Index = React.createClass
  displayName: 'OrchestrationsIndex'
  mixins: [createStoreMixin(OrchestrationStore), ImmutableRendererMixin]

  _handleFilterChange: (query) ->
    OrchestrationsActionCreators.setOrchestrationsFilter(query)

  getStateFromStores: ->
    totalOrchestrationsCount: OrchestrationStore.getAll().count()
    orchestrations: OrchestrationStore.getFiltered()
    pendingActions: OrchestrationStore.getPendingActions()
    isLoading: OrchestrationStore.getIsLoading()
    isLoaded: OrchestrationStore.getIsLoaded()
    filter: OrchestrationStore.getFilter()

  render: ->
    if @state.totalOrchestrationsCount
      div {className: 'container-fluid'},
        div {className: 'kbc-main-content'},
          div {className: 'row-searchbar'},
            SearchBar(onChange: @_handleFilterChange, query: @state.filter)
          if @state.orchestrations.count()
            @_renderTable()
          else
            @_renderNotFound()
    else
      div {className: 'container-fluid'},
        div {className: 'kbc-main-content'},
          @_renderEmptyState()

  _renderEmptyState: ->
    div className: 'row',
      h2 null,
        'Orchestrations allow you to group together related tasks and schedule their execution.'
      div null,
        React.createElement NewOrchestrationButton

  _renderNotFound: ->
    div className: 'kbc-header',
      div className: 'kbc-title',
        h2 null,
          'No orchestrations found.'

  _renderTable: ->
    childs = @state.orchestrations.map((orchestration) ->
      OrchestrationRow
        orchestration: orchestration
        pendingActions: @state.pendingActions.get(orchestration.get('id'), Immutable.Map())
        key: orchestration.get 'id'
    , @).toArray()

    div className: 'table table-striped table-hover',
      @_renderTableHeader()
      div className: 'tbody',
        childs

  _renderTableHeader: ->
    (div {className: 'thead', key: 'table-header'},
      (div {className: 'tr'},
        (span {className: 'th'},
          (strong null, 'Name')
        ),
        (span {className: 'th'},
          (strong null, 'Last Run')
        ),
        (span {className: 'th'},
          (strong null, 'Duration')
        ),
        (span {className: 'th'},
          (strong null, 'Schedule')
        ),
        (span {className: 'th'})
      )
    )

module.exports = Index
