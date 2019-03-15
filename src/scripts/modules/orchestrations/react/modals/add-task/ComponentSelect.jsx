import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';

export default createReactClass({
  propTypes: {
    components: PropTypes.object.isRequired,
    orchestrations: PropTypes.object.isRequired,
    onComponentSelect: PropTypes.func.isRequired
  },

  render() {
    return (
      <div>
        {this._renderSection('Extractors', this._getComponentsForType('extractor'))}
        {this._renderSection('Transformations', this._getComponentsForType('transformation'))}
        {this._renderSection('Writers', this._getComponentsForType('writer'))}
        {this._renderSection('Applications', this._getComponentsForType('application'))}
        {this._renderOrchestratorSection(
          'Orchestrations',
          this.props.components.filter(c => c.get('id') === 'orchestrator')
        )}
      </div>
    );
  },

  _renderSection(title, section) {
    if (!section || section.count() === 0) {
      return <span />;
    }

    const components = section
      .map((component, index) => {
        return (
          <tr key={index}>
            <td>
              <a onClick={this._handleSelect.bind(this, component)}>
                <ComponentIcon component={component} /> <ComponentName component={component} />{' '}
                <span className="kbc-icon-arrow-right pull-right" />
              </a>
            </td>
          </tr>
        );
      })
      .toArray();

    return (
      <div>
        <h2>{title}</h2>
        <table className="table table-striped table-hover kbc-tasks-list">
          <tbody>{components}</tbody>
        </table>
      </div>
    );
  },

  _renderOrchestratorSection(title, section) {
    if (this.props.orchestrations.count() === 0) {
      return <span />;
    }

    const components = section
      .map((component, index) => {
        return (
          <tr key={index}>
            <td>
              <a onClick={this._handleSelect.bind(this, component)}>
                <ComponentIcon component={component} /> <ComponentName component={component} />{' '}
                <span className="kbc-icon-arrow-right pull-right" />
              </a>
            </td>
          </tr>
        );
      })
      .toArray();

    return (
      <div>
        <h2>{title}</h2>
        <table className="table table-striped table-hover kbc-tasks-list">
          <tbody>{components}</tbody>
        </table>
      </div>
    );
  },

  _handleSelect(component) {
    return this.props.onComponentSelect(component);
  },

  _getComponentsForType(type) {
    return this.props.components.filter(component => component.get('type') === type);
  }
});
