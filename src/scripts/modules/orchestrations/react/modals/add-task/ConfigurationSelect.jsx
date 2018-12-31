import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';
import descriptionExcerpt from '../../../../../utils/descriptionExcerpt';
import fuzzy from 'fuzzy';
import {Button} from 'react-bootstrap';

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
    const filteredConfigurations = this._getFilteredConfigurations();
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
              <Button bsStyle="link" className="btn-link-inline" onClick={this._handleBack}>
                <i className="fa fa-chevron-left" />
                {' Back'}
              </Button>
            </div>
          </div>
        </div>
        {filteredConfigurations.count() > 0 ? (
          <div className="list-group">
            {filteredConfigurations
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
        ) : (
          <p style={{padding: '0px 20px'}}>No configuration found.</p>
        )}
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

    const configs = this.props.component.get('configurations');

    if (!filter) {
      return configs;
    }
    const filteredConfigs = configs.filter(
      config => fuzzy.match(filter, config.get('name', '')) || fuzzy.match(filter, config.get('id', ''))
    );
    return filteredConfigs;
  }
});
