React = require 'react'
Button = React.createFactory(require('react-bootstrap').Button)

Loader = React.createFactory(require('../../../../../react/common/common').Loader)
ExDbActionCreators = require '../../../exDbActionCreators'
Link = React.createFactory(require('react-router').Link)

{div, span} = React.DOM

module.exports = React.createClass
  displayName: 'TestCredentialsButtonGroup'
  propTypes:
    credentials: React.PropTypes.object.isRequired

  getInitialState: ->
    isTesting: false
    job: null

  _startTesting: ->
    @setState
      isTesting: true
      job: null

    ExDbActionCreators
    .testCredentials @props.credentials
    .then @_onTestingDone

  _onTestingDone: (job) ->
    @setState
      isTesting: false
      job: job

  render: ->
    div className: 'form-group',
      div className: 'col-xs-offset-4 col-sx-8',
        Button
          bsStyle: 'primary'
          disabled: @state.isTesting
          onClick: @_startTesting
        ,
          'Test Credentials'
        ' '
        Loader() if @state.isTesting
        if @state.job
          if @state.job.status == 'success'
            @_testSuccess @state.job
          else
            @_testError @state.job

  _testSuccess: (job) ->
    span className: 'text-success',
      span className: 'fa fa-fw fa-check'
      ' Connected! '
      Link
        to: 'jobDetail'
        params:
          jobId: job.id
      ,
        'details'

  _testError: (job) ->
    span className: 'text-danger',
      span className: 'fa fa-fw fa-meh-o'
      ' Failed to connect! '
      Link
        to: 'jobDetail'
        params:
          jobId: job.id
      ,
        'details'