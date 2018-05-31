Dispatcher = require('../../../Dispatcher')
Constants = require '../Constants'
Immutable = require('immutable')
{Map, List} = Immutable
_ = require 'underscore'
underscoreString = require 'underscore.string'
camelize = require 'underscore.string/camelize'
fuzzy = require 'fuzzy'
fuzzaldrin = require 'fuzzaldrin'
StoreUtils = require '../../../utils/StoreUtils'
ApplicationStore = require '../../../stores/ApplicationStore'

_store = Map(
  components: Map()
  filter: Map()
)

ComponentsStore = StoreUtils.createStore

  getComponentsTypes: ->
    components = _store.get 'componentsById'
    components.groupBy((val) ->
      val.get('type')).keySeq().toJS()

  getAll: ->
    _store.get 'componentsById'

  getAllForType: (type) ->
    _store.get('componentsById').filter((component) ->
      component.get('type') == type
    )

  getComponent: (id) ->
    _store.getIn ['componentsById', id]

  hasComponent: (id) ->
    _store.hasIn ['componentsById', id]

  getFilteredForType: (type) ->
    filter = @getComponentFilter(type).toLowerCase()
    all = @getAllForType(type)
    all.filter (component) ->
      description = component.get('description').toLowerCase()
      fuzzy.match(filter, component.get('name')) ||
        (fuzzaldrin.score(description, filter) > 0.09) ||
        description.indexOf(filter) >= 0


  getComponentFilter: (type) ->
    _store.getIn(['filter', type]) || ''

  hasComponentLegacyUI: (id) ->
    _store.getIn(['componentsById', id], Map()).get 'hasUI'

  getRecipeAppUrl: (recipeId, configurationId) ->
    projectId = ApplicationStore.getCurrentProjectId()
    legacyRecipeDetail = ApplicationStore.getUrlTemplates().get 'home'
    recipeAppName = "kbc.docToolRecipesApp"
    legacyRecipeDetail = "#{legacyRecipeDetail}/#{projectId}/application/?app=#{recipeAppName}"
    legacyRecipeDetail = "#{legacyRecipeDetail}#/#{recipeId}/#{configurationId}"


  getComponentDetailLegacyUrl: (id, configurationId) ->
    component = @getComponent id

    if component.get('type') == 'extractor'
      templateName = 'legacyExtractorDetail'
    else
      templateName = 'legacyWriterDetail'

    recipeId = id
    isRecipe = underscoreString.startsWith(recipeId, 'rcp-')
    if isRecipe
      return @getRecipeAppUrl(recipeId, configurationId)
    else
      template = ApplicationStore.getUrlTemplates().get templateName
      _.template(template)(
        projectId: ApplicationStore.getCurrentProjectId()
        appId: "kbc." + camelize(id)
        configId: configurationId
      )

  unknownComponent: (name) ->
    Map
      id: name
      name: name
      type: 'unknown'
      flags: List()
      data: Map()

Dispatcher.register (payload) ->
  action = payload.action

  switch action.type
    when Constants.ActionTypes.COMPONENTS_SET_FILTER
      _store = _store.setIn ['filter', action.componentType], action.query.trim()
      ComponentsStore.emitChange()

    when Constants.ActionTypes.COMPONENTS_LOAD_SUCCESS
      _store = _store.set 'componentsById', Immutable.fromJS(action.components).toMap().mapKeys((key, component) ->
        component.get 'id'
      )
      ComponentsStore.emitChange()

module.exports = ComponentsStore
