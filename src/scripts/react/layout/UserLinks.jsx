import React from 'react';
import request from '../../utils/request';
import { ExternalLink } from '@keboola/indigo-ui';
import _ from 'underscore';
import contactSupport from '../../utils/contactSupport';
import WishlistModalDialog from '../../modules/components/react/components/WishlistModalDialog';


export default React.createClass({
  propTypes: {
    urlTemplates: React.PropTypes.object.isRequired,
    currentProject: React.PropTypes.object.isRequired,
    xsrf: React.PropTypes.string.isRequired
  },

  _openWishlistModal(e) {
    this.state.showWishlistModal = true;
    e.preventDefault();
    e.stopPropagation();
  },

  getInitialState: function() {
    return {showWishlistModal: false};
  },

  _wishlistSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    request('POST', '/admin/projects/send-wishlist-request')
      .type('form')
      .send({title: 'test', description: 'whatever desc'})
      .promise()
      .then((response) => {
        // eslint-disable-next-line no-alert
        alert(response.body);
        this.state.showWishlistModal = false;
        return response.body;
      });
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
            <a href="" onClick={this._openWishlistModal}>
              <span className="fa fa-tasks" />
              {' Feature Wishlist '}
            </a>
          </li>
        </ul>
        <WishlistModalDialog
          show={this.state.showWishlistModal}
          onSubmit={this._wishlistSubmit}
        />
      </div>
    );
  },

  openSupportModal(e) {
    contactSupport({type: 'project'});
    e.preventDefault();
    e.stopPropagation();
  },
});
