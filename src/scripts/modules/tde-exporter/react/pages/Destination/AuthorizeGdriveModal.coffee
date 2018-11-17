React = require 'react'
{Modal} = require('react-bootstrap')
{button, strong, div, h2, span, h4, section, p} = React.DOM
AuthorizeAccount = React.createFactory(require('../../../../google-utils/react/AuthorizeAccount').default)
ApplicationStore = require('../../../../../stores/ApplicationStore').default
{Map} = require 'immutable'
ModalHeader = React.createFactory(require('react-bootstrap').Modal.Header)
ModalTitle = React.createFactory(require('react-bootstrap').Modal.Title)
ModalBody = React.createFactory(require('react-bootstrap').Modal.Body)
ModalFooter = React.createFactory(require('react-bootstrap').Modal.Footer)

Button = React.createFactory(require('react-bootstrap').Button)
ButtonToolbar = React.createFactory(require('react-bootstrap').ButtonToolbar)
RouterStore = require('../../../../../stores/RoutesStore').default

module.exports = React.createClass
  displayName: 'AuthorizeGdriveModal'

  render: ->
    show = !!@props.localState?.get('show')
    React.createElement Modal,
      show: show
      onHide: =>
        @props.updateLocalState(Map())
    ,
      ModalHeader closeButton: true,
        ModalTitle null,
          'Authorize Google Drive Account'
      ModalBody null,
        div null, 'You are about to authorize a Google Drive account for offline access.'
      AuthorizeAccount
        renderToForm: true
        caption: 'Authorize'
        className: 'pull-right'
        componentName: 'wr-google-drive'
        isInstantOnly: true
        refererUrl: @_getReferrer()
        noConfig: true
      ,
        ModalFooter null,
          ButtonToolbar null,
            Button
              className: 'btn btn-link'
              onClick: =>
                @props.updateLocalState(Map())
            ,
              'Cancel'
            Button
              type: 'submit'
              className: 'btn btn-success'
              'Authorize'

  _getReferrer: ->
    origin = ApplicationStore.getSapiUrl()
    url = RouterStore.getRouter().makeHref('tde-exporter-gdrive-redirect', config: @props.configId)
    projectUrl = ApplicationStore.getProjectBaseUrl()
    result = "#{origin}#{url}"
    return result
