import React from 'react';
import pureRendererMixin from 'react-addons-pure-render-mixin';
import { Map } from 'immutable';
import TransformationRow from '../../components/TransformationRow';

export default React.createClass({
  mixins: [pureRendererMixin],

  propTypes: {
    bucket: React.PropTypes.object.isRequired,
    transformations: React.PropTypes.object,
    pendingActions: React.PropTypes.object
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
