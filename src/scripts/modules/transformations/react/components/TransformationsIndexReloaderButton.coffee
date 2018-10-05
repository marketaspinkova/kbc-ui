React = require 'react'

createStoreMixin = require '../../../../react/mixins/createStoreMixin'

TransformationActionCreators = require '../../ActionCreators'
InstalledComponentsActionCreators = require '../../../components/InstalledComponentsActionCreators'
TransformationBucketsStore = require('../../stores/TransformationBucketsStore').default
RefreshIcon = React.createFactory(require('@keboola/indigo-ui').RefreshIcon)
{Loader} = require '@keboola/indigo-ui'

TransformationsIndexReloaderButton = React.createClass
  displayName: 'TransformationsIndexReloaderButton'
  mixins: [createStoreMixin(TransformationBucketsStore)]

  propTypes:
    allowRefresh: React.PropTypes.bool

  getDefaultProps: ->
    allowRefresh: false

  getStateFromStores: ->
    isLoading: TransformationBucketsStore.getIsLoading()

  _handleRefreshClick: (e) ->
    InstalledComponentsActionCreators.loadComponentConfigsData('transformation')

  render: ->
    if @props.allowRefresh
      RefreshIcon isLoading: @state.isLoading, onClick: @_handleRefreshClick
    else
      if @state.isLoading
        React.createElement Loader
      else
        return null


module.exports = TransformationsIndexReloaderButton
