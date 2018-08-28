React = require 'react'
ActivateDeactivateButton = require('../../../../../react/common/ActivateDeactivateButton').default
Confirm = require('../../../../../react/common/Confirm').default
Tooltip = require('../../../../../react/common/Tooltip').default
{Loader} = require '@keboola/indigo-ui'
{i, span, button, strong, div} = React.DOM
ImmutableRenderMixin = require 'react-immutable-render-mixin'
RunButtonModal = React.createFactory(require('../../../../components/react/components/RunComponentButton'))
SapiTableLinkEx = React.createFactory(require('../../../../components/react/components/StorageApiTableLinkEx').default)

InputMappingModal = require('../../../../components/react/components/generic/TableInputMappingModal').default

module.exports = React.createClass
  displayName: 'DropboxTableRow'
  mixins: [ImmutableRenderMixin]
  propTypes:
    deleteTableFn: React.PropTypes.func.isRequired
    isTableExported: React.PropTypes.bool.isRequired
    isPending: React.PropTypes.bool.isRequired
    prepareSingleUploadDataFn: React.PropTypes.func.isRequired
    table: React.PropTypes.object.isRequired
    mapping: React.PropTypes.object.isRequired
    mappingFromState: React.PropTypes.object.isRequired
    onEditTable: React.PropTypes.func
    componentId: React.PropTypes.string

    editOnChangeFn: React.PropTypes.func.isRequired
    editOnSaveFn: React.PropTypes.func.isRequired
    editOnCancelFn: React.PropTypes.func.isRequired
    destinations: React.PropTypes.object.isRequired
    tables: React.PropTypes.object.isRequired

  render: ->
    outputName = @props.mapping.get('destination') or "#{@props.mapping.get('source')}.csv"
    div {className: 'tr', key: @props.table.get('id')},
      span className: 'td',
        SapiTableLinkEx tableId: @props.table.get('id'),
          @props.table.get 'name'
      span className: 'td',
        i className: 'kbc-icon-arrow-right'
      span className: 'td',
        outputName
      span {className: 'td text-right'},
        @_renderEditButton()
        @_renderDeleteButton()
        React.createElement Tooltip,
          tooltip: 'Upload table to Dropbox'
        ,
          RunButtonModal
            title: "Run"
            tooltip: "Upload #{@props.table.get('id')}"
            mode: 'button'
            icon: 'fa fa-play fa-fw'
            component: @props.componentId
            runParams: =>
              configData: @props.prepareSingleUploadDataFn(@props.table)
          ,
           "You are about to run upload of #{@props.table.get('id')} to dropbox account. \
            The resulting file will be stored into 'Apps/Keboola Writer' dropbox folder."

  _renderEditButton: ->
    React.createElement(InputMappingModal,
      mode: 'edit'
      mapping: @props.mappingFromState
      tables: @props.tables
      onChange: @props.editOnChangeFn
      onCancel: @props.editOnCancelFn
      onSave: @props.editOnSaveFn
      otherDestinations: @props.destinations
      title: 'Edit table'
      showFileHint: false
      onEditStart: @props.onEditTable
      tooltipText: 'Edit table mapping'
    )

  _renderDeleteButton: ->
    if @props.isPending
      span className: 'btn btn-link',
        React.createElement Loader
    else
      React.createElement Confirm,
        key: @props.table.get 'id'
        title: "Remove #{@props.table.get('id')}"
        text: 'You are about to remove table from the configuration.'
        buttonLabel: 'Remove'
        onConfirm: =>
          @props.deleteTableFn(@props.table.get('id'))
      ,
        React.createElement Tooltip,
          tooltip: 'Remove table from configuration'
          placement: 'top'
          button className: 'btn btn-link',
            i className: 'kbc-icon-cup'
