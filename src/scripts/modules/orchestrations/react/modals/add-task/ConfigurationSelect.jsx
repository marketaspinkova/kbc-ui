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
    onReset: PropTypes.func.isRequired,
    onConfigurationSelect: PropTypes.func.isRequired,
    query: PropTypes.string.isRequired,
    searchBar: PropTypes.object.isRequired
  },

  componentDidMount() {
    this.props.searchBar.focus();
  },

  render() {
    return (
      <div className="orchestration-task-modal-body">
        <div className="table configuration-select-header">
          <div className="tr">
            <div className="td">
              <h2>
                <ComponentIcon component={this.props.component}/>{' '}
                <ComponentName component={this.props.component} showType={true}/>
              </h2>
            </div>
            <div className="td text-right">
              <a onClick={this._handleBack}>
                <span className="fa fa-chevron-left">{null}</span>
                {' Back'}
              </a>
            </div>
          </div>
        </div>
        <div className="list-group">
          {this._getFilteredConfigurations()
            .map(configuration => {
              return (
                <a
                  className="list-group-item configuration-select-list-group-item"
                  key={configuration.get('id')}
                  onClick={this._handleSelect.bind(this, configuration)}
                >
                  <span>
                    <strong>{configuration.get('name')}</strong>
                    <br/>
                    <small>{descriptionExcerpt(configuration.get('description'))}</small>
                  </span>
                  <i className="fa fa-plus-circle"/>
                </a>
              );
            }, this)
            .toArray()}
        </div>
      </div>
    );
  },

  _handleBack() {
    this.props.searchBar.focus();
    return this.props.onReset();
  },

  _handleSelect(configuration) {
    return this.props.onConfigurationSelect(configuration);
  },

  _getFilteredConfigurations() {
    const filter = this.props.query;

    const configs = this.props.component
      .get('configurations')
      .map(configuration => {
        return configuration;
      });

    if (!filter) {
      return configs;
    }
    const filteredConfigs = configs.filter(
      config => fuzzy.match(filter, config.get('name', '')) || fuzzy.match(filter, config.get('id', ''))
    );
    return filteredConfigs;
  }
});
