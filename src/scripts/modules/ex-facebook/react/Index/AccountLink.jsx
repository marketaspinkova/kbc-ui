import PropTypes from 'prop-types';
import React from 'react';
import {ExternalLink} from '@keboola/indigo-ui';

export default React.createClass({

  propTypes: {
    account: PropTypes.object.isRequired,
    componentId: PropTypes.string.isRequired
  },

  render() {
    if (this.props.componentId === 'keboola.ex-instagram') return this.renderFbPageLink('fb_page_id');
    if (this.props.componentId === 'keboola.ex-facebook') return this.renderFbPageLink();
    if (this.props.componentId === 'keboola.ex-facebook-ads') return this.renderFbAdAccountLink();

    return 'Unknown component ' + this.props.componentId;
  },

  renderFbPageLink(idProperty) {
    const {account} = this.props;
    const pageId = account.get(idProperty || 'id');
    const pageName = account.get('name');

    if (pageId) {
      return (
        <ExternalLink href={`https://www.facebook.com/${pageId}`}>
          {pageName || pageId}
        </ExternalLink>
      );
    }
    if (pageName) return pageName;
    return 'Unknown page';
  },

  renderFbAdAccountLink() {
    const {account} = this.props;
    const id = account.get('id');
    const accountId = account.get('account_id');
    const accountName = account.get('name');
    const businessName = account.get('business_name');

    if (accountId) {
      return (
        <ExternalLink href={`https://www.facebook.com/ads/manager/account/campaigns/?act=${accountId}`}>
          {accountName || businessName || accountId}
        </ExternalLink>
      );
    }
    if (accountName || businessName || id) return accountName || businessName || id;
    return 'Unknown Ad Account';
  }
});
