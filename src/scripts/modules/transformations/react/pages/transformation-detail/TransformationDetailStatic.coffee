React = require('react')
Link = React.createFactory(require('react-router').Link)
Immutable = require('immutable')
{Map, List} = Immutable
_ = require('underscore')

ImmutableRenderMixin = require 'react-immutable-render-mixin'
TransformationsActionCreators = require '../../../ActionCreators'
ApplicationStore = require '../../../../../stores/ApplicationStore'

InputMappingRow = React.createFactory(require('./InputMappingRow').default)
InputMappingDetail = React.createFactory(require('./InputMappingDetail').default)
OutputMappingRow = React.createFactory(require('./OutputMappingRow').default)
OutputMappingDetail = React.createFactory(require('./OutputMappingDetail').default)
{Panel} = require('react-bootstrap')
Panel  = React.createFactory Panel
TransformationTypeLabel = React.createFactory(require '../../components/TransformationTypeLabel')
Requires = require('./Requires').default
Packages = require('./Packages').default
SavedFiles = require('./SavedFiles').default
Queries = require('./Queries').default
Scripts = require('./Scripts').default
Phase = require('./Phase').default
AddOutputMapping = require('./AddOutputMapping').default
AddInputMapping = require('./AddInputMapping').default
InlineEditArea = require '../../../../../react/common/InlineEditArea'
TransformationEmptyInputImage = React.createFactory(require('../../components/TransformationEmptyInputImage').default)
TransformationEmptyOutputImage = React.createFactory(require('../../components/TransformationEmptyOutputImage').default)
ConfigurationRowEditField = React.createFactory(require(
  '../../../../components/react/components/ConfigurationRowEditField'
))

{getInputMappingValue, getOutputMappingValue,
  findInputMappingDefinition, findOutputMappingDefinition} = require('../../../../components/utils/mappingDefinitions')


{div, span, input, strong, form, button, h2, h3, i, ul, li, button, a, small, p, code, em, small, img} = React.DOM

module.exports = React.createClass
  displayName: 'TransformationDetailStatic'

  mixins: [ImmutableRenderMixin]

  propTypes:
    bucket: React.PropTypes.object.isRequired
    transformation: React.PropTypes.object.isRequired
    editingFields: React.PropTypes.object.isRequired
    isEditingValid: React.PropTypes.bool.isRequired
    isQueriesProcessing: React.PropTypes.bool.isRequired
    transformations: React.PropTypes.object.isRequired
    pendingActions: React.PropTypes.object.isRequired
    tables: React.PropTypes.object.isRequired
    buckets: React.PropTypes.object.isRequired
    bucketId: React.PropTypes.string.isRequired
    transformationId: React.PropTypes.string.isRequired
    openInputMappings: React.PropTypes.object.isRequired
    openOutputMappings: React.PropTypes.object.isRequired
    showDetails: React.PropTypes.bool.isRequired

  # TODO move this to component definition UI Options
  openRefine:
    inputMappingDefinitions: Immutable.fromJS([
      {
        'label': 'Load data from table',
        'destination': 'data.csv'
      }
    ])
    outputMappingDefinitions: Immutable.fromJS([
      {
        'label': 'Save result to table',
        'source': 'data.csv'
      }
    ])

  _isMySqlTransformation: ->
    @props.transformation.get("backend") == "db" || @props.transformation.get("backend") == "mysql"

  _isOpenRefineTransformation: ->
    @props.transformation.get("backend") == "docker" && @props.transformation.get("type") == "openrefine"

  _getInputMappingValue: ->
    value = @props.transformation.get("input", List())
    if (@_isOpenRefineTransformation())
      return getInputMappingValue(@openRefine.inputMappingDefinitions, value)
    return value

  _getOutputMappingValue: ->
    value = @props.transformation.get("output", List())
    if (@_isOpenRefineTransformation())
      return getOutputMappingValue(@openRefine.outputMappingDefinitions, value)
    return value

  _toggleInputMapping: (index) ->
    TransformationsActionCreators.toggleOpenInputMapping(@props.bucketId, @props.transformationId, index)

  _toggleOutputMapping: (index) ->
    TransformationsActionCreators.toggleOpenOutputMapping(@props.bucketId, @props.transformationId, index)

  _getDependentTransformations: ->
    props = @props
    @props.transformations.filter((transformation) ->
      transformation.get("requires").contains(props.transformation.get("id"))
    )

  _inputMappingDestinations: (exclude) ->
    @_getInputMappingValue().map((mapping, key) ->
      if key != exclude
        return mapping.get("destination").toLowerCase()
    ).filter((destination) ->
      destination != undefined
    )

  _renderRequires: ->
    props = @props
    span {},
      React.createElement Requires,
        disabled: @_isMySqlTransformation()
        transformation: @props.transformation
        transformations: @props.transformations
        isSaving: @props.pendingActions.has('save-requires')
        requires: @props.editingFields.get('requires', @props.transformation.get("requires"))
        bucketId: @props.bucketId
        onEditChange: (newValue) =>
          TransformationsActionCreators.updateTransformationEditingField(@props.bucketId,
            @props.transformationId, 'requires', newValue)
          TransformationsActionCreators.saveTransformationEditingField(@props.bucketId,
            @props.transformationId, 'requires')
      if @_getDependentTransformations().count()
        [
          h2
            style:
              lineHeight: '32px'
            key: 'requires-title'
          ,
            'Dependent transformations'
        ,
          span key: 'requires-dependents',
            div {},
              @_getDependentTransformations().map((dependent) ->
                Link
                  key: dependent.get("id")
                  to: 'transformationDetail'
                  params: {row: dependent.get("id"), config: @props.bucket.get('id')}
                ,
                  span {className: 'label kbc-label-rounded-small label-default'},
                    if dependent.get("phase", 1) != props.transformation.get("phase", 1)
                      dependent.get("name") + " (phase mismatch)"
                    else
                      dependent.get("name")
              , @).toArray()
          span
            className: 'help-block'
            key: 'requires-help'
          ,
            'These transformations are dependent on the current transformation.'

        ]

  _renderDetail: ->
    props = @props
    component = @
    span null,
      div {className: 'kbc-row'},
        p className: 'text-right',
          React.createElement Phase,
            bucketId: @props.bucketId
            transformation: @props.transformation
            disabled: @_isMySqlTransformation()
          ' '
          TransformationTypeLabel
            backend: @props.transformation.get 'backend'
            type: @props.transformation.get 'type'

        if @_isOpenRefineTransformation()
          [
            h2 {},
              'OpenRefine Beta Warning'

            div {className: "help-block"},
              span {},
                'OpenRefine transformations are now in public beta. '
                'Please be aware, that things may change before it makes to production. '
                'If you encounter any errors, please contact us at '
                a {href: "mailto:support@keboola.com"},
                  'support@keboola.com'
                ' or read more in the '
                a {href: "https://help.keboola.com/manipulation/transformations/openrefine/"},
                  'documentation'
                '.'
          ]

        if @_isMySqlTransformation()
          div {className: "alert alert-warning"},
            h3 {},
              'MySQL Deprecation Warning'

            div {className: "help-block"},
              span {},
                'MySQL transformations are deprecated. '
                'Please migrate this transformation to Snowflake. '
                'If you encounter any issues, please contact us using the support button. '
                'Learn more about the MySQL transformation deprecation '
                a {href: "http://status.keboola.com/deprecating-mysql-storage-and-transformations"},
                  'timeline and reasons'
                '.'

        ConfigurationRowEditField
          componentId: 'transformation'
          configId: @props.bucketId
          rowId: @props.transformationId
          fieldName: 'description'
          editElement: InlineEditArea
          placeholder: "Describe transformation"
          fallbackValue: @props.transformation.get("description")
      if @props.transformation.get('backend') != 'docker' ||
          ApplicationStore.hasCurrentProjectFeature('transformations-mixed-backends') &&
          @props.transformation.get('backend') == 'docker'&&
          ['python', 'r'].includes(@props.transformation.get('type'))
        div {className: 'kbc-row'},
          @_renderRequires()

      div {className: 'kbc-row'},
        div {className: 'mapping'},
          h2 {},
            'Input Mapping'
            if !@_isOpenRefineTransformation() && !@_isMySqlTransformation()
              span className: 'pull-right add-mapping-button',
                if !@_getInputMappingValue().count()
                  small className: 'empty-label',
                    'No input assigned'
                React.createElement AddInputMapping,
                  tables: @props.tables
                  transformation: @props.transformation
                  bucket: @props.bucket
                  mapping: @props.editingFields.get('new-input-mapping', Map())
                  otherDestinations: @_inputMappingDestinations()
          if @_getInputMappingValue().count()
            div {className: 'mapping-rows'},
              @_getInputMappingValue().map((input, key) ->
                if (@_isOpenRefineTransformation())
                  definition = findInputMappingDefinition(@openRefine.inputMappingDefinitions, input)
                Panel
                  className: 'kbc-panel-heading-with-table'
                  key: key
                  collapsible: true
                  eventKey: key
                  expanded: props.openInputMappings.get(key, false)
                  header:
                    div
                      onClick: ->
                        component._toggleInputMapping(key)
                    ,
                      InputMappingRow
                        transformation: @props.transformation
                        bucket: @props.bucket
                        inputMapping: input
                        tables: @props.tables
                        editingInputMapping: @props.editingFields.get('input-' + key, input)
                        editingId: 'input-' + key
                        mappingIndex: key.toString()
                        pendingActions: @props.pendingActions
                        otherDestinations: @_inputMappingDestinations(key)
                        definition: definition
                        disabled: @_isMySqlTransformation()
                ,
                  InputMappingDetail
                    fill: true
                    transformationBackend: @props.transformation.get('backend')
                    inputMapping: input
                    tables: @props.tables
                    definition: definition
              , @).toArray()
          else
            div {className: "text-center"},
              TransformationEmptyInputImage {}
      div {className: 'kbc-row'},
        div {className: 'mapping'},
          h2 {},
            'Output Mapping'
            if !@_isOpenRefineTransformation() && !@_isMySqlTransformation()
              span className: 'pull-right add-mapping-button',
                if !@_getOutputMappingValue().count()
                  small className: 'empty-label',
                    'No output assigned'
                React.createElement AddOutputMapping,
                  tables: @props.tables
                  buckets: @props.buckets
                  transformation: @props.transformation
                  bucket: @props.bucket
                  mapping: @props.editingFields.get('new-output-mapping', Map())
                  transformation: @props.transformation
          if @_getOutputMappingValue().count()
            div {className: 'mapping-rows'},
              @_getOutputMappingValue().map((output, key) ->
                if (@_isOpenRefineTransformation())
                  definition = findOutputMappingDefinition(@openRefine.outputMappingDefinitions, output)
                Panel
                  className: 'kbc-panel-heading-with-table'
                  key: key
                  collapsible: true
                  eventKey: key
                  expanded: props.openOutputMappings.get(key, false)
                  header:
                    div
                      onClick: ->
                        component._toggleOutputMapping(key)
                    ,
                      OutputMappingRow
                        transformation: @props.transformation
                        bucket: @props.bucket
                        outputMapping: output
                        editingOutputMapping: @props.editingFields.get('input-' + key, output)
                        editingId: 'input-' + key
                        mappingIndex: key
                        tables: @props.tables
                        pendingActions: @props.pendingActions
                        buckets: @props.buckets
                        definition: definition
                        otherOutputMappings: @props.transformation.get('output')
                          .filter((otherOutputMapping, otherOutputMappingKey) ->
                            return otherOutputMappingKey != key
                          )
                        disabled: @_isMySqlTransformation()
                ,
                  OutputMappingDetail
                    outputMapping: output

              , @).toArray()
          else
            div {className: "text-center"},
              TransformationEmptyOutputImage {}
      if @props.transformation.get('backend') == 'docker' && @props.transformation.get('type') != 'openrefine'
        div {className: 'kbc-row'},
          React.createElement Packages,
            transformation: @props.transformation
            isSaving: @props.pendingActions.has('save-packages')
            packages: @props.editingFields.get('packages', @props.transformation.get("packages", List()))
            onEditChange: (newValue) =>
              TransformationsActionCreators.updateTransformationEditingField(@props.bucketId,
                @props.transformationId, 'packages', newValue)
              TransformationsActionCreators.saveTransformationEditingField(@props.bucketId,
                @props.transformationId, 'packages')
          div {},
            React.createElement SavedFiles,
              isSaving: @props.pendingActions.has('save-tags')
              tags: @props.editingFields.get('tags', @props.transformation.get("tags", List()))
              onEditChange: (newValue) =>
                TransformationsActionCreators.updateTransformationEditingField(@props.bucketId,
                  @props.transformationId, 'tags', newValue)
                TransformationsActionCreators.saveTransformationEditingField(@props.bucketId,
                  @props.transformationId, 'tags')
      div {className: 'kbc-row'},
        @_renderCodeEditor()

  _renderCodeEditor: ->
    if  @props.transformation.get('backend') == 'docker'
      React.createElement Scripts,
        bucketId: @props.bucket.get('id')
        transformation: @props.transformation
        isEditing: @props.editingFields.has('queriesString')
        isSaving: @props.pendingActions.has('save-queries')
        scripts: @props.editingFields.get('queriesString', @props.transformation.get("queriesString"))
        isEditingValid: @props.isEditingValid
        isChanged: @props.editingFields.get('queriesChanged', false)
        onEditCancel: =>
          TransformationsActionCreators.cancelTransformationEditingField(@props.bucketId,
            @props.transformationId, 'queriesString')
          TransformationsActionCreators.cancelTransformationEditingField(@props.bucketId,
            @props.transformationId, 'queriesChanged')
        onEditChange: (newValue) =>
          TransformationsActionCreators.updateTransformationEditingField(@props.bucketId,
            @props.transformationId, 'queriesString', newValue)
          if !@props.editingFields.get('queriesChanged', false)
            TransformationsActionCreators.updateTransformationEditingField(@props.bucketId,
              @props.transformationId, 'queriesChanged', true)
        onEditSubmit: =>
          TransformationsActionCreators.saveTransformationScript(@props.bucketId,
            @props.transformationId)
    else
      React.createElement Queries,
        bucketId: @props.bucket.get('id')
        transformation: @props.transformation
        isEditing: @props.editingFields.has('queriesString')
        isSaving: @props.pendingActions.has('save-queries')
        queries: @props.editingFields.get('queriesString', @props.transformation.get('queriesString'))
        splitQueries: @props.editingFields.get('splitQueries', @props.transformation.get('queries'))
        isQueriesProcessing: @props.isQueriesProcessing
        isChanged: @props.editingFields.get('queriesChanged', false)
        highlightQueryNumber: @props.highlightQueryNumber
        highlightingQueryDisabled: @props.highlightingQueryDisabled
        disabled: @_isMySqlTransformation()
        onEditCancel: =>
          TransformationsActionCreators.cancelTransformationEditingField(@props.bucketId,
            @props.transformationId, 'queriesString')
          TransformationsActionCreators.cancelTransformationEditingField(@props.bucketId,
            @props.transformationId, 'queriesChanged')
        onEditChange: (newValue) =>
          TransformationsActionCreators.updateTransformationEditingField(@props.bucketId,
            @props.transformationId, 'queriesString', newValue)
          TransformationsActionCreators.updateTransformationEditingFieldQueriesString(@props.bucketId,
            @props.transformationId, newValue)
          if !@props.editingFields.get('queriesChanged', false)
            TransformationsActionCreators.updateTransformationEditingField(@props.bucketId,
              @props.transformationId, 'queriesChanged', true)
        onEditSubmit: =>
          TransformationsActionCreators.saveTransformationQueries(@props.bucketId,
            @props.transformationId)

  render: ->
    div null,
      if @props.showDetails
        @_renderDetail()
      else
        div {className: 'kbc-row'},
          div {className: 'well'},
            "This transformation is not supported in UI."
