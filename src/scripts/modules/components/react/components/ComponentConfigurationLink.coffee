React = require 'react'
RoutesStore = require '../../../../stores/RoutesStore'
ComponentsStore = require '../../stores/ComponentsStore'
TransformationStore = require '../../../transformations/stores/TransformationsStore'
{GENERIC_DETAIL_PREFIX} = require('../../Constants').Routes
Link = React.createFactory require('react-router').Link
{a, span} = React.DOM

###
  Creates link depending on component type
  - Link to current SPA page if UI is present
  - Link to legacy UI page
  - Disabled link if UI is not prepared at all

###
module.exports = React.createClass
  displayName: 'ComponentConfigurationLink'
  propTypes:
    componentId: React.PropTypes.string.isRequired
    configId: React.PropTypes.string.isRequired
    className: React.PropTypes.string
    job: React.PropTypes.object

  render: ->
    transformationId = @props.job.getIn(['params', 'transformations', 0], null)
    if @props.componentId == 'transformation'
      span null,
        Link
          className: @props.className
          to: 'transformationBucket'
          params: {config: @props.configId}
          title: 'go to bucket'
        ,
        @props.children

        if transformationId != null
          transformationName = TransformationStore.getTransformationName(@props.configId, transformationId)
          span null, ' / ',
          Link
            className: @props.className
            to: 'transformationDetail'
            title: 'go to transformation'
            params:
              {
                row: transformationId,
                config: @props.configId
              }
          ,
            transformationName

    else if @props.componentId == 'orchestrator'
      Link
        className: @props.className
        to: 'orchestration'
        params:
          orchestrationId: @props.configId
        ,
          @props.children
    else if RoutesStore.hasRoute(@props.componentId)
      Link
        className: @props.className
        to: @props.componentId
        params:
          config: @props.configId
      ,
        @props.children
    else if ComponentsStore.hasComponentLegacyUI(@props.componentId)
      a
        href: ComponentsStore.getComponentDetailLegacyUrl(@props.componentId, @props.configId)
        className: @props.className
      ,
        @props.children
    else if @getComponentType() != 'other'
      Link
        className: @props.className
        to: GENERIC_DETAIL_PREFIX + @getComponentType() + '-config'
        params:
          config: @props.configId
          component: @props.componentId
      ,
        @props.children
    else
      span className: @props.className,
        @props.children

  getComponentType: ->
    component = ComponentsStore.getComponent(@props.componentId)
    return 'extractor' if !component
    component.get 'type'


