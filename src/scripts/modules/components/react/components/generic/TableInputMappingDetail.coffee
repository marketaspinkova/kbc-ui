React = require 'react'
Link = React.createFactory(require('react-router').Link)
ImmutableRenderMixin = require 'react-immutable-render-mixin'
TableSizeLabel = React.createFactory(require('../../../../transformations/react/components/TableSizeLabel').default)
FileSize = React.createFactory(require('../../../../../react/common/FileSize').default)
Check = React.createFactory(require('@keboola/indigo-ui').Check)
ListGroup = React.createFactory(require('react-bootstrap').ListGroup)
ListGroupItem = React.createFactory(require('react-bootstrap').ListGroupItem)
_ = require('underscore')
TableLinkEx = React.createFactory(require('../../../../components/react/components/StorageApiTableLinkEx').default)
FiltersDescription = require './FiltersDescription'

{span, div, a, button, i, h4, small, em, ul, li, strong} = React.DOM
numeral = require 'numeral'
Immutable = require 'immutable'

TableInputMappingDetail = React.createClass(
  displayName: 'TableInputMappingDetail'
  mixins: [ImmutableRenderMixin]

  propTypes:
    value: React.PropTypes.object.isRequired
    tables: React.PropTypes.object.isRequired
    definition: React.PropTypes.object

  getDefaultProps: ->
    definition: Immutable.Map()

  render: ->
    ListGroupItems = [

      ListGroupItem {className: "row", key: 'source'},
        strong {className: "col-md-4"},
          'Source table'
        span {className: "col-md-6"},
          TableLinkEx
            tableId: @props.value.get('source')

      ListGroupItem {className: "row", key: 'columns'},
        strong {className: "col-md-4"},
          'Columns'
        span {className: "col-md-6"},
          if @props.value.get('columns', Immutable.List()).count()
            @props.value.get('columns').join(', ')
          else
            'Use all columns'

      ListGroupItem {className: "row", key: 'where_column'},
        strong {className: "col-md-4"},
          'Filters'
        React.createElement FiltersDescription,
          value: @props.value
    ]
    ListGroup {className: "clearfix"}, _.reject(ListGroupItems, (obj) -> obj == undefined)
)

module.exports = TableInputMappingDetail
