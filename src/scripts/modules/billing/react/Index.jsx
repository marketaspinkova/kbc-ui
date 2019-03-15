import React from 'react';
import createReactClass from 'create-react-class';
import Graph from './Graph';
import UsageByMonth from './UsageByMonth';
import ProjectPowerLimit from './ProjectPowerLimit';
import SettingsTabs from '../../../react/layout/SettingsTabs';

export function componentIoSummary(data, metric) {
  return data
    .reduce(function(reduction, component) {
      return reduction
        + component.get(metric).get('inBytes')
        + component.get(metric).get('outBytes');
    }, 0);
}

export default createReactClass({

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <SettingsTabs active="settings-project-power" />
          <div className="tab-content">
            <div className="tab-pane tab-pane-no-padding active">
              <div className="kbc-header">
                <div className="row">
                  <div className="col-md-6">
                    <Graph/>
                    <ProjectPowerLimit/>
                  </div>
                  <div className="col-md-6">
                    <UsageByMonth />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

});
