React = require 'react'
ImmutableRenderMixin = require 'react-immutable-render-mixin'
TableSizeLabel = React.createFactory(require '../../components/TableSizeLabel')
TransformationTableTypeLabel = React.createFactory(require '../../components/TransformationTableTypeLabel')
FileSize = React.createFactory(require '../../../../../react/common/FileSize')
Check = React.createFactory(require('@keboola/indigo-ui').Check)
{span, div, a, button, i, h4, small, em, ul, li, strong} = React.DOM
numeral = require 'numeral'
ListGroup = React.createFactory(require('react-bootstrap').ListGroup)
ListGroupItem = React.createFactory(require('react-bootstrap').ListGroupItem)
_ = require('underscore')
TableLinkEx = React.createFactory(require('../../../../components/react/components/StorageApiTableLinkEx').default)
Immutable = require('immutable')

OutputMappingDetail = React.createClass(
  displayName: 'InputMappingDetail'
  mixins: [ImmutableRenderMixin]

  propTypes:
    transformationBackend: React.PropTypes.string.isRequired
    outputMapping: React.PropTypes.object.isRequired
    tables: React.PropTypes.object.isRequired
    definition: React.PropTypes.object

  getDefaultProps: ->
    definition: Immutable.Map()

  render: ->
    ListGroupItems = [

      ListGroupItem {className: "row", key: 'destination'},
        strong {className: "col-md-4"},
          'Destination table'
        span {className: "col-md-6"},
          TableLinkEx
            tableId: @props.outputMapping.get('destination')

      ListGroupItem {className: "row", key: 'primaryKey'},
        strong {className: "col-md-4"},
          'Primary key'
        span {className: "col-md-6"},
          if @props.outputMapping.get('primaryKey', Immutable.List()).count()
            @props.outputMapping.get('primaryKey').join(', ')
          else
            'N/A'

      ListGroupItem {className: "row", key: 'incremental'},
        strong {className: "col-md-4"},
          'Incremental'
        span {className: "col-md-6"},
          Check
            isChecked: @props.outputMapping.get('incremental')

      ListGroupItem {className: "row", key: 'deleteWhere'},
        strong {className: "col-md-4"},
          'Delete rows'
        span {className: "col-md-6"},
          if @props.outputMapping.get('deleteWhereColumn') && @props.outputMapping.get('deleteWhereValues')
            span {},
              'Where '
              strong {},
                @props.outputMapping.get('deleteWhereColumn')
              ' '
              @_getDeleteWhereOperator()
              ' '
              strong {},
                @props.outputMapping.get('deleteWhereValues').map((value) ->
                  if value == ''
                    return '[empty string]'
                  if value == ' '
                    return '[space character]'
                  return value
                ).join(', ')
          else
            'N/A'
    ]
    ListGroup {}, _.reject(ListGroupItems, (obj) -> obj == undefined)
)

module.exports = OutputMappingDetail
