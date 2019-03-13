import PropTypes from 'prop-types';
import React from 'react';
import { Map } from 'immutable';

import QueryRow from './QueryRow';
import StorageApiBucketLink from '../../../../components/react/components/StorageApiBucketLink';
import CreateQueryElement from '../../components/CreateQueryElement';

export default React.createClass({
  propTypes: {
    queries: PropTypes.object,
    configurationId: PropTypes.string,
    componentId: PropTypes.string,
    pendingActions: PropTypes.object,
    actionCreators: PropTypes.object
  },
  render() {
    return (
      <div>
        <div className="kbc-inner-padding">
          <div className="text-right">
            <CreateQueryElement
              actionCreators={this.props.actionCreators}
              componentId={this.props.componentId}
              configurationId={this.props.configurationId}
              isNav={false}
            />
          </div>
          <p>
            Output bucket:{' '}
            <StorageApiBucketLink bucketId={`in.c-keboola-ex-mongodb-${this.props.configurationId}`}>
              {`in.c-keboola-ex-mongodb-${this.props.configurationId}`}
            </StorageApiBucketLink>
          </p>
        </div>
        <div className="table table-striped table-hover">
          <div className="thead">
            <div className="tr">
              <span className="th">
                <strong>Name</strong>
              </span>
              <span className="th">
                <strong>Incremental</strong>
              </span>
              <span className="th" />
            </div>
          </div>
          <div className="tbody">
            {this.props.queries.map(query => {
              return (
                <QueryRow
                  componentId={this.props.componentId}
                  configurationId={this.props.configurationId}
                  pendingActions={this.props.pendingActions.get(query.get('id'), Map())}
                  query={query}
                  key={query.get('id')}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
});
