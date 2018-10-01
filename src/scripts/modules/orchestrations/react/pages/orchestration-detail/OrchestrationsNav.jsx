import React from 'react';
import OrchestrationsNavRow from './OrchestrationsNavRow';
import ImmutableRendererMixin from 'react-immutable-render-mixin';

export default React.createClass({
  mixins: [ImmutableRendererMixin],

  propTypes: {
    orchestrations: React.PropTypes.object.isRequired,
    activeOrchestrationId: React.PropTypes.number.isRequired
  },

  render() {
    return (
      <div className="list-group kb-orchestrations-nav">
        {this.props.orchestrations.size ? (
          this.props.orchestrations
            .map(orchestration => {
              return (
                <OrchestrationsNavRow
                  orchestration={orchestration}
                  key={orchestration.get('id')}
                  isActive={this.props.activeOrchestrationId === orchestration.get('id')}
                />
              );
            })
            .toArray()
        ) : (
          <div className="list-group-item">No Orchestrations found</div>
        )}
      </div>
    );
  }
});
