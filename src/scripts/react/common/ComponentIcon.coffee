React = require 'react'

{span, img, i} = React.DOM

ComponentIcon = React.createClass(
  displayName: 'ComponentIcon'

  propTypes:
    component: React.PropTypes.object
    size: React.PropTypes.string

  defaultIconClass:
    extractor: 'fa-cloud-download'
    writer: 'fa-cloud-upload'
    transformation: 'fa-cogs'
    other: 'fa-cogs'

  getDefaultProps: ->
    size: '32'

  render: ->
    component = @props.component
    if !component
      return (span {})
    if !component.get("ico#{@props.size}")
      return (
        span {className: "kb-sapi-component-icon #{@props.className}"},
          (span {className: "kb-default"},
            (i {
              className: "fa #{@defaultIconClass[component.get('type')]}",
              style: {
                "font-size": (@props.size - 5) + "px",
                height: @props.size + "px"
                position: "relative"
                top: "5px"
              }
            })
          )
      )
    return (
      span {className: "kb-sapi-component-icon #{@props.className}"},
        (span {},
          (img {src: component.get("ico#{@props.size}")})
        )
    )
)


module.exports = ComponentIcon