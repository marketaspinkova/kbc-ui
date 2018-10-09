React = require 'react'
pureRendererMixin = require 'react-immutable-render-mixin'
Immutable = require('immutable')

TransformationRow = React.createFactory(require '../../components/TransformationRow')
{div, span, strong} = React.DOM

module.exports = React.createClass
  displayName: 'TransformationsList'
  mixin: [pureRendererMixin]
  propTypes:
    bucket: React.PropTypes.object.isRequired
    transformations: React.PropTypes.object
    pendingActions: React.PropTypes.object

  render: ->
    if @props.transformations.count()
      childs = @props.transformations.map((transformation) ->
        TransformationRow
          bucket: @props.bucket
          transformation: transformation
          pendingActions: @props.pendingActions.getIn([transformation.get("id")], Immutable.Map())
          key: transformation.get 'id'
          hideButtons: true
      , @).toArray()

      div className: 'row',
        div className: 'table table-striped table-hover table-no-margin',
          div className: 'tbody',
            childs
    else
      div {},
        "No transformations found"
