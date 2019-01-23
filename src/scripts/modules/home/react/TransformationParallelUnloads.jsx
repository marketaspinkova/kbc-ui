import React, {PropTypes} from 'react';
import Immutable from 'immutable';
import TransformationBucketsStore from '../../transformations/stores/TransformationBucketsStore';
import TransformationsStore from '../../transformations/stores/TransformationsStore';
import ComponentConfigurationRowLink from '../../components/react/components/ComponentConfigurationRowLink';
import { AlertBlock } from '@keboola/indigo-ui';
import { getConflictsForBucket } from '../../transformations/react/components/duplicite-output-mapping/detect';
import ApplicationStore from '../../../stores/ApplicationStore';
import { ExternalLink } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    transformations: PropTypes.object
  },

  render() {
    if (!this.props.transformations) {
      return null;
    }
    const projectHasFeature = ApplicationStore.getCurrentProjectFeatures().includes('transformation-parallel-unloads');
    if (projectHasFeature) {
      return null;
    }
    let duplicitTransformationsByBucket = new Immutable.Map();
    this.props.transformations.forEach(function(bucket, bucketId) {
      const bucketConflicts = getConflictsForBucket(bucket);
      if (bucketConflicts.count() > 0) {
        // deduplicate by transformation id
        const deduplicatedBucketConflicts = bucketConflicts.groupBy((conflict) => {
          return conflict.get('id');
        }).map((groupedConflicts) => {
          return groupedConflicts.first();
        }).toList();
        duplicitTransformationsByBucket = duplicitTransformationsByBucket.set(bucketId, deduplicatedBucketConflicts);
      }
    });

    if (duplicitTransformationsByBucket.isEmpty() && !projectHasFeature) {
      return (
        <AlertBlock type="warning" title="Speed up output mapping of your transformations">
          <p>
            Your project is ready, if you are eager to parallelize output mapping of your transformations,
            please use the support button to let us know.
          </p>
        </AlertBlock>
      );
    }

    return (
      <AlertBlock type="warning" title="Transformations slowing down your output mappings">
        <p>
          We cannot turn on parallel output mapping for this project as these transformations have duplicit output mappings
          (multiple output mappings writing to the same table in Storage). Please fix the transformations so we can turn on
          faster output mapping for you. Read more <ExternalLink href="http://status.keboola.com/speeding-up-transformation-output-mappings-in-your-projects">here</ExternalLink>.
        </p>
        <div className="row">
          {duplicitTransformationsByBucket.map(function(bucketConflicts, bucketId) {
            return (
              <div className="col-md-6" key={bucketId}>
                <h4>
                  <span className={'kbc-transformation-icon'}/>
                  {TransformationBucketsStore.get(bucketId).get('name', bucketId)}
                </h4>
                <ul className="list-unstyled">
                  {bucketConflicts.map(function(conflict, conflictIndex) {
                    return (
                      <li key={conflictIndex}>
                        <ComponentConfigurationRowLink
                          componentId="transformation"
                          configId={bucketId}
                          rowId={conflict.get('id')}
                        >
                          {TransformationsStore.getTransformation(bucketId, conflict.get('id')).get('name', conflict.get('id'))}
                        </ComponentConfigurationRowLink>
                      </li>
                    );
                  }).toSeq().toArray()}
                </ul>
              </div>
            );
          }).toSeq().toArray()}
        </div>
      </AlertBlock>
    );
  }
});
