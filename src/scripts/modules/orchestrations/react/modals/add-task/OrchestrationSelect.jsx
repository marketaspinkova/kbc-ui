import React from 'react';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';
import InstalledComponentsStore from  '../../../../components/stores/InstalledComponentsStore';
import descriptionExcerpt from '../../../../../utils/descriptionExcerpt';

export default React.createClass({
  propTypes: {
    component: React.PropTypes.object.isRequired,
    orchestrations: React.PropTypes.object.isRequired,
    onReset: React.PropTypes.func.isRequired,
    onConfigurationSelect: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <div>
        <div className="table configuration-select-header">
          <div className="tr">
            <div className="td">
              <h2>
                <ComponentIcon component={this.props.component} />{' '}
                <ComponentName component={this.props.component} showType={true} />
              </h2>
            </div>
            <div className="td">
              <a className="pull-right" onClick={this._handleBack}>
                <span className="fa fa-chevron-left">{null}</span>
                {' Back'}
              </a>
            </div>
          </div>
        </div>
        <div className="list-group">
          {this.props.orchestrations
            .map(configuration => {
              return (
                <a
                  className="list-group-item  configuration-select-list-group-item"
                  key={configuration.get('id')}
                  onClick={this._handleSelect.bind(this, configuration)}
                >
                  <span>
                    <strong>{configuration.get('name')}</strong>
                    <br/>
                    <small>{descriptionExcerpt(InstalledComponentsStore.getConfig('orchestrator', configuration.get('id').toString()).get('description'))}</small>
                  </span>
                  <i className="fa fa-plus-circle pull-right" />
                </a>
              );
            })
            .toArray()}
        </div>
      </div>
    );
  },

  _handleBack() {
    return this.props.onReset();
  },

  _handleSelect(configuration) {
    return this.props.onConfigurationSelect(configuration);
  }
});
