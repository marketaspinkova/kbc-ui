import PropTypes from 'prop-types';
import React from 'react';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';
import descriptionExcerpt from '../../../../../utils/descriptionExcerpt';

export default React.createClass({
  propTypes: {
    component: PropTypes.object.isRequired,
    onReset: PropTypes.func.isRequired,
    onConfigurationSelect: PropTypes.func.isRequired
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
            <div className="td text-right">
              <a onClick={this._handleBack}>
                <span className="fa fa-chevron-left">{null}</span>
                {' Back'}
              </a>
            </div>
          </div>
        </div>
        <div className="list-group">
          {this.props.component
            .get('configurations')
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
    return this.props.onReset();
  },

  _handleSelect(configuration) {
    return this.props.onConfigurationSelect(configuration);
  }
});
