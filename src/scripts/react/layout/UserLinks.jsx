import React from 'react';
import { ExternalLink } from '@keboola/indigo-ui';
import _ from 'underscore';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import contactSupport from '../../utils/contactSupport';
import WishlistModalDialog from './wishlist/WishlistModalDialog';
import WishlistApi from './wishlist/WishlistApi';

export default React.createClass({
  propTypes: {
    urlTemplates: React.PropTypes.object.isRequired,
    currentProject: React.PropTypes.object.isRequired,
    xsrf: React.PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      showWishlistModal: false,
      sendingWishlish: false
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
          isLoading={this.state.sendingWishlish}
          onSubmit={this.handeSubmit}
          onHide={this.closeWishlistModal}
        />
      </div>
    );
  },

  handeSubmit(title, description) {
    this.setState({ sendingWishlish: true });
    WishlistApi.sendRequest({ title, description })
      .then(() => {
        ApplicationActionCreators.sendNotification({
          message: 'Your request was successfully sended.'
        });
      })
      .finally(() => {
        this.setState({ sendingWishlish: false });
      });
  },

  openSupportModal(e) {
    contactSupport({type: 'project'});
    e.preventDefault();
    e.stopPropagation();
  },

  openWishlistModal(e) {
    e.preventDefault();
    this.setState({ showWishlistModal: true });
  },

  closeWishlistModal() {
    this.setState({ showWishlistModal: false });
  }
});
