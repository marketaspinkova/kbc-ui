import React from 'react';

import createReactClass from 'create-react-class';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import BucketsStore from '../../stores/TransformationBucketsStore';

import { Link } from 'react-router';
import NewTransformationBucketButton from './NewTransformationBucketButton';

export default createReactClass({
  mixins: [createStoreMixin(BucketsStore)],

  getStateFromStores() {
    return { hasBuckets: BucketsStore.getAll().count() > 0 };
  },

  render() {
    return (
      <span>
        <Link to="sandbox">
          <button className="btn btn-link">
            <span className="kbc-icon-cog" />
            {' Sandbox'}
          </button>
        </Link>
        {this.state.hasBuckets && <NewTransformationBucketButton />}
      </span>
    );
  }
});
