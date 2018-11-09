React = require 'react'
_ = require 'underscore'
filesize = require 'filesize'
Link = React.createFactory(require('react-router').Link)
{OverlayTrigger, Tooltip} = require 'react-bootstrap'
{option, select, button, i,a, strong, span, div, p, ul, li} = React.DOM
Confirm = require('../../../../../react/common/Confirm').default
date = require('../../../../../utils/date').default
RunButtonModal = React.createFactory(require('../../../../components/react/components/RunComponentButton'))
SapiTableLinkEx = require('../../../../components/react/components/StorageApiTableLinkEx').default

module.exports = React.createClass
  displayName: 'tablerowtde'

  propTypes:
    table: React.PropTypes.object.isRequired
    configId: React.PropTypes.string.isRequired
    tdeFile: React.PropTypes.object
    deleteRowFn: React.PropTypes.func
    prepareRunDataFn: React.PropTypes.func
    configData: React.PropTypes.object
    uploadComponentId: React.PropTypes.string
    tdeFileName: React.PropTypes.string
    uploadComponentIdSetFn: React.PropTypes.func

  render: ->
    div className: 'tr',
      span className: 'td',
        React.createElement SapiTableLinkEx,
          tableId: @props.table.get 'id'
          linkLabel: @props.table.get 'name'

      if @props.tdeFile
        span className: 'td',
          React.createElement OverlayTrigger,
            overlay: React.createElement Tooltip,
              id: @props.tdeFile.get('id')
            ,
              div null, @props.tdeFile.getIn(['creatorToken','description'])
              div null, date.format @props.tdeFile.get('created')
              div null, filesize(@props.tdeFile.get('sizeBytes'))

            placement: 'top'
          ,
            a href: @props.tdeFile.get('url'),
              @props.tdeFile.get('name')
      else
        span className: 'td', @props.tdeFileName

      # ACTION BUTTONS
      span className: 'td text-right kbc-no-wrap',
        if not @props.isDeleted
          React.createElement OverlayTrigger,
            overlay: React.createElement Tooltip, null, 'Edit table configuration'
            placement: 'top'
          ,
            Link
              className: 'btn btn-link'
              to: "tde-exporter-table"
              params:
                config: @props.configId
                tableId: @props.table.get('id')
            ,
              i className: 'fa fa-fw kbc-icon-pencil'
        ,
        React.createElement Confirm,
          key: @props.table.get 'id'
          title: "Remove #{@props.table.get('id')}"
          text: 'You are about to remove the table from the configuration.'
          buttonLabel: 'Remove'
          onConfirm: =>
            @props.deleteRowFn()
        ,
          React.createElement OverlayTrigger,
            overlay: React.createElement Tooltip, null, 'Delete table from configuration'
            placement: 'top'

            button className: 'btn btn-link',
              i className: 'kbc-icon-cup'
        if not @props.isDeleted
          @_renderRunButton()


  _renderRunButton: ->
    React.createElement OverlayTrigger,
      overlay: React.createElement Tooltip, null, 'Export to TDE File'
      placement: 'top'
    ,
      RunButtonModal
        title: "Export #{@props.table.get('id')} to TDE"
        tooltip: "Export #{@props.table.get('id')} to TDE"
        mode: 'button'
        component: 'tde-exporter'
        runParams: =>
          @props.prepareRunDataFn()
      ,
       "You are about export #{@props.table.get('id')} to TDE."
