/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import StoreUtils, { initStore } from '../../utils/StoreUtils';
import Immutable from 'immutable';
import dispatcher from '../../Dispatcher';
import * as constants from './constants';

const { Map, List } = Immutable;

let _store = initStore('GooddataWriterDateDimensionsStore', Map({
  dimensionsById: Map(),
  newDimensions: Map(),
  isLoading: Map()
}));

const DimensionsStore = StoreUtils.createStore({
  getAll(configurationId) {
    return _store
      .getIn(['dimensionsById', configurationId], Map())
      .sortBy((dimension) => dimension.get('name'));
  },

  isLoading(configurationId) {
    return _store.hasIn(['isLoading', configurationId]);
  },

  isCreatingNewDimension(configurationId) {
    return _store.hasIn(['newDimensions', configurationId, 'isSaving']);
  },

  getNewDimension(configurationId) {
    return _store.getIn(
      ['newDimensions', configurationId, 'dimension'],
      Map({
        name: '',
        includeTime: false,
        template: constants.DateDimensionTemplates.GOOD_DATA,
        customTemplate: '',
        identifier: ''
      })
    );
  }
});

dispatcher.register(function(payload) {
  const { action } = payload;

  switch (action.type) {
    case constants.ActionTypes.GOOD_DATA_WRITER_LOAD_DATE_DIMENSIONS_START:
      _store = _store.setIn(['isLoading', action.configurationId], true);
      return DimensionsStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_LOAD_DATE_DIMENSIONS_ERROR:
      _store = _store.deleteIn(['isLoading', action.configurationId]);
      return DimensionsStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_LOAD_DATE_DIMENSIONS_SUCCESS:
      var dimensionsById = Immutable.fromJS(action.dimensions).map((dimension) =>
        Map({
          isLoading: false,
          name: dimension.get('name'),
          pendingActions: List(),
          data: dimension
        })
      );
      dimensionsById = dimensionsById.toMap().mapKeys((_, dim) => dim.get('name'));
      _store = _store.withMutations((store) =>
        store
          .deleteIn(['isLoading', action.configurationId])
          .setIn(['dimensionsById', action.configurationId], dimensionsById)
      );

      return DimensionsStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_UPLOAD_START:
      _store = _store.updateIn(
        ['dimensionsById', action.configurationId, action.dimensionName, 'pendingActions'],
        (actions) => actions.push('upload')
      );
      return DimensionsStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_UPLOAD_SUCCESS:
    case constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_UPLOAD_ERROR:
      _store = _store.withMutations((store) =>
        store.updateIn(
          ['dimensionsById', action.configurationId, action.dimensionName, 'pendingActions'],
          (actions) => actions.delete(actions.indexOf('upload'))
        )
      );
      return DimensionsStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_DELETE_ERROR:
      _store = _store.updateIn(
        ['dimensionsById', action.configurationId, action.dimensionName, 'pendingActions'],
        (actions) => actions.delete(actions.indexOf('delete'))
      );
      return DimensionsStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_DELETE_START:
      _store = _store.updateIn(
        ['dimensionsById', action.configurationId, action.dimensionName, 'pendingActions'],
        (actions) => actions.push('delete')
      );
      return DimensionsStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_DELETE_SUCCESS:
      _store = _store.withMutations((store) =>
        store
          .updateIn(
            ['dimensionsById', action.configurationId, action.dimensionName, 'pendingActions'],
            (actions) => actions.delete(actions.indexOf('delete'))
          )
          .deleteIn(['dimensionsById', action.configurationId, action.dimensionName])
      );
      return DimensionsStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_NEW_DATE_DIMENSION_UPDATE:
      _store = _store.setIn(
        ['newDimensions', action.configurationId, 'dimension'],
        action.dimension
      );
      return DimensionsStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_NEW_DATE_DIMENSION_SAVE_START:
      _store = _store.setIn(['newDimensions', action.configurationId, 'isSaving'], true);
      return DimensionsStore.emitChange();

    case constants.ActionTypes.GOOD_DATA_WRITER_NEW_DATE_DIMENSION_SAVE_SUCCESS:
      _store = _store.withMutations((store) =>
        store.deleteIn(['newDimensions', action.configurationId]).setIn(
          ['dimensionsById', action.configurationId, action.dimension.get('name')],
          Map({
            isLoading: false,
            id: action.dimension.get('name'),
            pendingActions: List(),
            data: action.dimension
          })
        )
      );

      return DimensionsStore.emitChange();
    default:
      break;
  }
});

export default DimensionsStore;
