import React from 'react';
import ComponentsActionCreators from '../../ComponentsActionCreators';
import {SearchBar} from '@keboola/indigo-ui';
import ComponentBox from '../../../../react/common/ComponentBox';
import contactSupport from '../../../../utils/contactSupport';
import {Button} from 'react-bootstrap';


export default React.createClass({
  propTypes: {
    components: React.PropTypes.object.isRequired,
    filter: React.PropTypes.string,
    componentType: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    children: React.PropTypes.any
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
        <div className="components-overview-grid">
          {this.renderComponents()}
        </div>
        <div className="row">
          <div className="text-center">
            <h2>Haven't found what you're looking for?</h2>
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
      .map((component) =>(<ComponentBox component={component} key={component.get('id')}/>));
  }
});
