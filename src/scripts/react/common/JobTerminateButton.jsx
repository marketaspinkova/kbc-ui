import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Confirm from './Confirm';
import {Loader} from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    job: PropTypes.object.isRequired,
    isTerminating: PropTypes.bool.isRequired,
    onTerminate: PropTypes.func.isRequired
  },

  render() {
    if (this.canBeTerminated()) {
      return (
        <Confirm
          title="Terminate Job"
          text={`Do you really want to terminate the job ${this.props.job.get('id')}?`}
          buttonLabel="Terminate"
          onConfirm={this.props.onTerminate}
        >
          <button className="btn btn-link" disabled={this.props.isTerminating}>
            {this.props.isTerminating ? <Loader/> : null}
            <span className="fa fa-fw fa-times"/> Terminate job
          </button>
        </Confirm>
      );
    }
    return null;
  },

  canBeTerminated() {
    return this.props.job && (this.props.job.get('status') === 'waiting' || this.props.job.get('status') === 'processing');
  }

});
