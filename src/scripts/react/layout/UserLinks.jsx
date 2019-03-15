import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { ExternalLink } from '@keboola/indigo-ui';
import _ from 'underscore';

import contactSupport from '../../utils/contactSupport';
import WishlistModalDialog from './wishlist/WishlistModalDialog';
import { sendWishlistRequest } from './wishlist/WishlistApi';

export default createReactClass({
  propTypes: {
    urlTemplates: PropTypes.object.isRequired,
    currentProject: PropTypes.object.isRequired,
    xsrf: PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      showWishlistModal: false
    };
  },

  render() {
    return (
      <div className="kbc-user-links">
        <ul className="nav">
          <li>
            <a href="" onClick={this.openSupportModal}>
              <span className="fa fa-comment" />
              {' Support '}
            </a>
          </li>
          <li>
            <ExternalLink href="https://help.keboola.com">
              <span className="fa fa-question-circle" />
              {' Help '}
            </ExternalLink>
          </li>
          <li>
            <a
              href={
                _.template(this.props.urlTemplates.get('project'))({
                  projectId: this.props.currentProject.get('id')
                }) + '/settings-users'
              }
            >
              <span className="fa fa-user" />
              {' Users & Settings '}
            </a>
          </li>
          <li>
            <a href="" onClick={this.openWishlistModal}>
              <span className="fa fa-tasks" />
              {' Feature Wishlist '}
            </a>
          </li>
        </ul>

        <WishlistModalDialog
          show={this.state.showWishlistModal}
          onSubmit={this.handleSubmit}
          onHide={this.closeWishlistModal}
        />
      </div>
    );
  },

  handleSubmit(description) {
    return sendWishlistRequest({
      description,
      xsrf: this.props.xsrf
    });
  },

  openSupportModal(e) {
    e.preventDefault();
    contactSupport({ type: 'project' });
  },

  openWishlistModal(e) {
    e.preventDefault();
    this.setState({ showWishlistModal: true });
  },

  closeWishlistModal() {
    this.setState({ showWishlistModal: false });
  }
});
