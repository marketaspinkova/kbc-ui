import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Link } from 'react-router';
import InstalledComponentsStore from '../../stores/InstalledComponentsStore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';

export default createReactClass({
  mixins: [createStoreMixin(InstalledComponentsStore)],

  propTypes: {
    type: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
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
