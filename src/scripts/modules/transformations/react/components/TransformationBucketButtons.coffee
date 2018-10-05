React = require 'react'

createStoreMixin = require '../../../../react/mixins/createStoreMixin'
BucketsStore = require('../../stores/TransformationBucketsStore').default

{Link} = require('react-router')
NewTransformationBucketButton = require './NewTransformationBucketButton'

{span, button} = React.DOM

module.exports = React.createClass
  displayName: 'NewTransformationBucketButton'
  mixins: [createStoreMixin(BucketsStore)]

  getStateFromStores: ->
    hasBuckets: BucketsStore.getAll().count()

  render: ->
    span {},
      React.createElement Link,
        to: 'sandbox'
      ,
        button className: 'btn btn-link',
          span className: 'kbc-icon-cog'
          ' Sandbox'
      if @state.hasBuckets
        React.createElement NewTransformationBucketButton