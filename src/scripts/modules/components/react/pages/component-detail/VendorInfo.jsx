import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { List } from 'immutable';
import is3rdParty from '../../../is3rdParty';

export default createReactClass({
  propTypes: {
    component: PropTypes.object.isRequired
  },

  render() {
    return (
      <div className="kbcVendorInfo">
        {is3rdParty(this.props.component) && (
          <div>
            Component developed by
            {this._renderAddress()}
          </div>
        )}
      </div>
    );
  },

  _renderAddress() {
    const contactData = this.props.component.getIn(['data', 'vendor', 'contact'], 'No Address');

    if (!List.isList(contactData)) {
      return (
        <address>
          <strong>{contactData}</strong>
        </address>
      );
    }

    return (
      <address>
        <strong>{contactData.first()}</strong>
        {contactData.rest().map((line, index) => (
          <span key={index}>
            <br />
            {line}
          </span>
        ))}
      </address>
    );
  }
});
