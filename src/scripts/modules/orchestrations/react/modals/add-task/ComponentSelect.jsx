import React from 'react';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';

export default React.createClass({
  propTypes: {
    components: React.PropTypes.object.isRequired,
    orchestrations: React.PropTypes.object.isRequired,
    onComponentSelect: React.PropTypes.func.isRequired
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
    if (!section || section.size === 0) {
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
    if (!section || section.size === 0) {
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
          <tbody>{this.props.orchestrations.count() && components}</tbody>
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
