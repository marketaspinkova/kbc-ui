import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ComponentsActionCreators from '../../ComponentsActionCreators';
import {SearchBar} from '@keboola/indigo-ui';
import ComponentBox from '../../../../react/common/ComponentBox';
import contactSupport from '../../../../utils/contactSupport';
import {Button} from 'react-bootstrap';


export default createReactClass({
  propTypes: {
    components: PropTypes.object.isRequired,
    filter: PropTypes.string,
    componentType: PropTypes.string.isRequired,
    className: PropTypes.string,
    children: PropTypes.any
  },

  render() {
    return (
      <div className={this.props.className}>
        {this.props.children}
        <div className="row-searchbar">
          <SearchBar
            onChange={this.handleFilterChange}
            query={this.props.filter}
          />
        </div>
        <div className="table kbc-table-border-vertical kbc-components-overview kbc-layout-table">
          <div className="tbody">
            {this.renderComponents()}
          </div>
        </div>
        <div className="row">
          <div className="text-center">
            <h2>Haven&apos;t found what you&apos;re looking for?</h2>
            <Button bsStyle="primary" onClick={contactSupport}>Let us know</Button>
          </div>
        </div>
      </div>
    );
  },

  handleFilterChange(query) {
    ComponentsActionCreators
      .setComponentsFilter(query, this.props.componentType);
  },

  renderComponents() {
    return this.props.components
      .toIndexedSeq()
      .sortBy((component) => component.get('name').toLowerCase())
      .groupBy((component, i) => Math.floor(i / 3))
      .map(this.renderComponentsRow)
      .toArray();
  },

  renderComponentsRow(components, index) {
    return (
      <div className="tr" key={index}>
        {components.map((component) => {
          return (
            <ComponentBox component={component} key={component.get('id')} />
          );
        })}
      </div>
    );
  }
});
