import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';
import descriptionExcerpt from '../../../../../utils/descriptionExcerpt';
import fuzzy from 'fuzzy';

export default createReactClass({
  propTypes: {
    component: PropTypes.object.isRequired,
    orchestrations: PropTypes.object.isRequired,
    orchestratorConfigurations: PropTypes.object.isRequired,
    onReset: PropTypes.func.isRequired,
    onConfigurationSelect: PropTypes.func.isRequired,
    query: PropTypes.string,
    searchBar: PropTypes.object
  },

  // componentDidMount() {
  //   this.props.searchBar.focus();
  // },

  render() {
    return (
      <div className="orchestration-task-modal-body">
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
          {this._getFilteredOrchestrations()
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
                    <small>
                      {descriptionExcerpt(
                        this.props.orchestratorConfigurations.getIn([configuration.get('id').toString(), 'description'])
                      )}
                    </small>
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
  },

  _getFilteredOrchestrations() {
    const filter = this.props.query;
    const orchestrations = this.props.orchestrations;

    if (!filter) {
      return orchestrations;
    }

    const filteredOrchestrations = orchestrations.filter(
      orchestration => fuzzy.match(filter, orchestration.get('name', '') || fuzzy.match(filter, orchestration.get('id', '')))
    );
    return filteredOrchestrations;
  }
});
