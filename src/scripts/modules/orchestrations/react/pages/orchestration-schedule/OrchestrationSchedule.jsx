import React from 'react';
import OrchestrationStore from '../../../stores/OrchestrationsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import {Button} from 'react-bootstrap';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';
import CronScheduler from '../../../../../react/common/CronScheduler';

/* eslint no-console: 0 */

export default React.createClass({
  mixins: [createStoreMixin(OrchestrationStore)],
  propTypes: {
    crontabRecord: React.PropTypes.string
  },

  getStateFromStores() {
    const orchestrationId = RoutesStore.getCurrentRouteIntParam('orchestrationId');
    const orchestration = OrchestrationStore.get(orchestrationId);
    const crontabRecord = orchestration.get('crontabRecord') || '0 0 * * *';
    console.log(crontabRecord);

    return {
      orchestrationId,
      crontabRecord
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div>
            <CronScheduler crontabRecord={this.state.crontabRecord} onChange={()=>null} />
            <div className="col-sm-6">
              <Button
                className="pull-left"
                bsStyle="danger"
                onClick={this._handleRemoveSchedule}
                disabled={this.state.isSaving}
              >
                Remove Schedule
              </Button>
            </div>
            <div className="col-sm-6">
              <ConfirmButtons
                isSaving={false}
                isDisabled={false}
                saveLabel="Save"
                onCancel={false}
                onSave={()=> null}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
});
