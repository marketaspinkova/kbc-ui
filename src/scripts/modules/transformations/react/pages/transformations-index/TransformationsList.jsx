import PropTypes from 'prop-types';
import React from 'react';
import pureRendererMixin from 'react-immutable-render-mixin';
import { Map } from 'immutable';
import TransformationRow from '../../components/TransformationRow';

export default React.createClass({
  mixins: [pureRendererMixin],

  propTypes: {
    bucket: PropTypes.object.isRequired,
    transformations: PropTypes.object,
    pendingActions: PropTypes.object
  },

  render() {
    if (this.props.transformations.count() === 0) {
      return <div>No transformations found</div>;
    }

    return (
      <div className="row">
        <div className="table table-striped table-hover table-no-margin">
          <div className="tbody">
            {this.props.transformations
              .map(transformation => {
                return (
                  <TransformationRow
                    bucket={this.props.bucket}
                    transformation={transformation}
                    pendingActions={this.props.pendingActions.getIn([transformation.get('id')], Map())}
                    key={transformation.get('id')}
                    hideButtons={true}
                  />
                );
              })
              .toArray()}
          </div>
        </div>
      </div>
    );
  }
});
