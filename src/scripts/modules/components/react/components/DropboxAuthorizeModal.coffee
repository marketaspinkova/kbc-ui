React = require('react')
ApplicationStore = require('../../../../stores/ApplicationStore').default
_ = require('underscore')
ButtonToolbar = React.createFactory(require('react-bootstrap').ButtonToolbar)
Button = React.createFactory(require('react-bootstrap').Button)
Modal = React.createFactory(require('react-bootstrap').Modal)
ModalHeader = React.createFactory(require('react-bootstrap').Modal.Header)
ModalTitle = React.createFactory(require('react-bootstrap').Modal.Title)
ModalBody = React.createFactory(require('react-bootstrap').Modal.Body)
ModalFooter = React.createFactory(require('react-bootstrap').Modal.Footer)
Input = React.createFactory(require('./../../../../react/common/KbcBootstrap').Input)
RouterStore = require('../../../../stores/RoutesStore').default

{i, span, div, p, strong, form, input, label, div} = React.DOM

module.exports = React.createClass
  displayName: "DropboxAuthorizeModal"

  propTypes:
    configId: React.PropTypes.string.isRequired
    redirectRouterPath: React.PropTypes.string
    credentialsId: React.PropTypes.string
    componentId: React.PropTypes.string
    renderOpenButtonAsLink: React.PropTypes.bool

  getInitialState: ->
    oauthUrl = 'https://syrup.keboola.com/oauth/auth20'
    description: ""
    token: ApplicationStore.getSapiTokenString()
    oauthUrl: oauthUrl
    router: RouterStore.getRouter()
    showModal: false

  getDefaultProps: ->
    renderOpenButtonAsLink: false

  close: ->
    @setState
      showModal: false

  open: ->
    @setState
      showModal: true

  render: ->
    div null,
      @renderOpenButton()
      Modal
        show: @state.showModal
        onHide: @close
      ,
        ModalHeader closeButton: true,
          ModalTitle null,
            'Authorize Dropbox Account'

        form
          className: 'form-horizontal'
          action: @state.oauthUrl
          method: 'POST'
          @_createHiddenInput('api', @props.componentId)
          @_createHiddenInput('id', @props.credentialsId or @props.configId)
          @_createHiddenInput('token', @state.token)
          @_createHiddenInput('returnUrl', @_getRedirectUrl())
        ,
          ModalBody null,
            Input
              label: "Dropbox Email"
              type: 'text'
              ref: 'description'
              name: 'description'
              help: 'Used afterwards as a description of the authorized account'
              labelClassName: 'col-xs-3'
              wrapperClassName: 'col-xs-9'
              defaultValue: @state.description
              autoFocus: true
              onChange: (event) =>
                @setState
                  description: event.target.value

          ModalFooter null,
            ButtonToolbar null,
              Button
                onClick: @close
                bsStyle: 'link'
              ,
                'Cancel'
              Button
                bsStyle: 'success'
                type: 'submit'
                disabled: _.isEmpty(@state.description)
              ,
                span null,
                  i className: 'fa fa-fw fa-dropbox'
                  ' Authorize'

  renderOpenButton: ->
    if @props.renderOpenButtonAsLink
      span
        onClick: @open
        className: 'btn btn-link',
        i className: 'fa fa-fw fa-user'
        ' Authorize'
    else
      Button
        onClick: @open
        bsStyle: 'success'
      ,
        i className: 'fa fa-fw fa-dropbox'
        ' Authorize'

  _createHiddenInput: (name, value) ->
    input
      name: name
      type: 'hidden'
      value: value

  _getRedirectUrl: ->
    origin = ApplicationStore.getSapiUrl()
    url = @state.router.makeHref(@props.redirectRouterPath, config: @props.configId)
    result = "#{origin}#{url}"
    result
