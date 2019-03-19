import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Immutable from 'immutable';
import ComponentConfigurationRowLink from '../../components/react/components/ComponentConfigurationRowLink';
import { AlertBlock } from '@keboola/indigo-ui';
import { getConflictsForBucket } from '../../transformations/react/components/duplicite-output-mapping/detect';
import { ExternalLink } from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    transformations: PropTypes.object,
    transformationBuckets: PropTypes.object
  },

  render() {
    if (!this.props.transformations) {
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

    if (duplicitTransformationsByBucket.isEmpty()) {
      return (
        <AlertBlock type="warning" title="Speed up output of your transformations">
          <p>
            Your project is ready. If you wish to parallelize output processing for your transformations,
            please use the support button to let us know.
          </p>
        </AlertBlock>
      );
    }

    const transformations = this.props.transformations;
    const transformationBuckets = this.props.transformationBuckets;
    return (
      <AlertBlock type="warning" title="Transformations slowing down your output">
        <p>
          We cannot turn on parallel output processing for this project as these transformations write outputs
          to the same table in Storage. Please fix the transformations so we can turn on
          faster output processing for this project.
        </p>
        <div className="row">
          {duplicitTransformationsByBucket.map(function(bucketConflicts, bucketId) {
            return (
              <div className="col-md-6" key={bucketId}>
                <h4>
                  <span className={'kbc-transformation-icon'}/>
                  {transformationBuckets.get(bucketId).get('name', bucketId)}
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
                          {transformations.getIn([bucketId, conflict.get('id'), 'name'], conflict.get('id'))}
                        </ComponentConfigurationRowLink>
                      </li>
                    );
                  }).toSeq().toArray()}
                </ul>
              </div>
            );
          }).toSeq().toArray()}
        </div>
        <p>
          Read more about speeding up the output by using
          {' '}<ExternalLink
            href="https://status.keboola.com/speeding-up-transformation-outputs-in-your-projects">
            parallel unloads
          </ExternalLink>.
        </p>
      </AlertBlock>
    );
  }
});
