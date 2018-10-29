React = require 'react'

InstalledComponentsStore = require('../../stores/InstalledComponentsStore').default
InstalledComponentsActionCreators = require '../../InstalledComponentsActionCreators'
createStoreMixin = require('../../../../react/mixins/createStoreMixin').default

Confirm = require('../../../../react/common/Confirm').default
{Loader} = require '@keboola/indigo-ui'
trashUtils = require '../../../trash/utils.js'

module.exports = React.createClass
  displayName: 'DeleteConfigurationButton'
  mixins: [createStoreMixin(InstalledComponentsStore)]
  propTypes:
    preDeleteFn: React.PropTypes.func
    postDeleteFn: React.PropTypes.func
    componentId: React.PropTypes.string.isRequired
    configId: React.PropTypes.string.isRequired

  getStateFromStores: ->
    config: InstalledComponentsStore.getConfig(@props.componentId, @props.configId)
    isDeleting: InstalledComponentsStore.isDeletingConfig @props.componentId, @props.configId, @props.fieldName

  _handleDelete: ->
    if @props.preDeleteFn
      @props.preDeleteFn()
    InstalledComponentsActionCreators.deleteConfiguration(@props.componentId, @props.configId, true)
    .then =>
      if @props.postDeleteFn
        @props.postDeleteFn()



  render: ->
    if trashUtils.isObsoleteComponent(@props.componentId)
      React.createElement Confirm,
        title: 'Move Configuration to Trash'
        text: [
          React.DOM.p key: 'question',
            "Are you sure you want to move the configuration #{this.state.config.get('name')} to Trash?",
          React.DOM.p key: 'warning',
            React.DOM.i className: 'fa fa-exclamation-triangle'
            " This configuration can't be restored."
        ]
        buttonLabel: 'Move to Trash'
        onConfirm: @_handleDelete
        childrenRootElement: React.DOM.a
      ,
        @_renderIcon()
        ' Move to Trash'
    else
      React.DOM.a
        onClick: @_handleDelete
      ,
        @_renderIcon()
        ' Move to Trash'

  _renderIcon: ->
    if @state.isDeleting
      React.createElement Loader
    else
      React.DOM.span className: 'kbc-icon-cup fa fa-fw'
