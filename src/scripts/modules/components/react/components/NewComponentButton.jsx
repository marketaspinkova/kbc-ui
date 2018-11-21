import React from 'react';
import { Link } from 'react-router';
import InstalledComponentsStore from '../../stores/InstalledComponentsStore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore)],

  propTypes: {
    type: React.PropTypes.string.isRequired,
    to: React.PropTypes.string.isRequired,
    text: React.PropTypes.string.isRequired
  },

  getStateFromStores() {
    return { hasInstalled: InstalledComponentsStore.getAllForType(this.props.type).count() > 0 };
  },

  render() {
    if (!this.state.hasInstalled) {
      return <span />;
    }

    return (
      <Link to={this.props.to} className="btn btn-success" activeClassName="">
        <i className="kbc-icon-plus" />
        {this.props.text}
      </Link>
    );
  }
});
