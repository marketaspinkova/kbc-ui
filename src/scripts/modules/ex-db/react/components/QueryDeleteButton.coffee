React = require 'react'
ExDbActionCreators = require '../../exDbActionCreators'

Tooltip = React.createFactory(require('react-bootstrap').Tooltip)
OverlayTrigger = React.createFactory(require('react-bootstrap').OverlayTrigger)
Confirm = React.createFactory(require '../../../../react/common/Confirm')

{button, span, i} = React.DOM

###
  Enabled/Disabled orchestration button with tooltip
###
module.exports = React.createClass
  displayName: 'QueryDeleteButton'
  propTypes:
    query: React.PropTypes.object.isRequired
    configurationId: React.PropTypes.string.isRequired

  render: ->
    OverlayTrigger
      overlay: Tooltip null, 'Delete orchestration'
      key: 'delete'
      placement: 'top'
    ,
      Confirm
        title: 'Delete Query'
        text: "Do you really want to delete query?"
        buttonLabel: 'Delete'
        onConfirm: @_deleteQuery
      ,
        button className: 'btn btn-link',
          i className: 'kbc-icon-cup'

  _deleteQuery: ->
    ExDbActionCreators.deleteQuery @props.configurationId, @props.query.get('id')