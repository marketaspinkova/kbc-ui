React = require 'react'
ComponentsActionCreators = require '../../ComponentsActionCreators'
SearchRow = React.createFactory(require('../../../../react/common/SearchRow').default)
ComponentBox = React.createFactory(require('../../../../react/common/ComponentBox').default)
Link = React.createFactory(require('react-router').Link)
Button = React.createFactory(require('react-bootstrap').Button)


{div, table, tbody, tr, td, ul, li, a, span, h2, p, button, i} = React.DOM

require('./NewComponentSelection.less')

module.exports = React.createClass
  displayName: 'NewComponentSelection'
  propTypes:
    components: React.PropTypes.object.isRequired
    filter: React.PropTypes.string
    componentType: React.PropTypes.string.isRequired

  render: ->
    div className: @props.className,
      @props.children
      SearchRow(className: 'row kbc-search-row', onChange: @_handleFilterChange, query: @props.filter)
      div className: 'table kbc-table-border-vertical kbc-components-overview kbc-layout-table',
        div className: 'tbody',
          @_renderComponents()
      div className: 'row',
        div className: 'text-center',
          h2 null, 'Haven\'t found what you\'re looking for?'
          a
            className: 'btn btn-primary'
            href: 'mailto:support@keboola.com'
          ,
            'Let us know'

  _handleFilterChange: (query) ->
    ComponentsActionCreators.setComponentsFilter(query, @props.componentType)

  _renderComponents: ->
    @props.components
    .toIndexedSeq()
    .sortBy((component) -> component.get('name').toLowerCase())
    .groupBy((component, i) -> Math.floor(i / 3))
    .map(@_renderComponentsRow, @)
    .toArray()

  _renderComponentsRow: (components, idx) ->
    div
      className: 'tr'
      key: idx
    , components.map((component) ->
      ComponentBox
        component: component
        key: component.get('id')
    ).toArray()
