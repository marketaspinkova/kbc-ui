import React from 'react';
import { ExternalLink } from '@keboola/indigo-ui';
import ApplicationStore from '../../stores/ApplicationStore';
import contactSupport from '../../utils/contactSupport';

export default React.createClass({
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
            <a href={ApplicationStore.getProjectPageUrl('settings-users')}>
              <span className="fa fa-user" />
              {' Users & Settings '}
            </a>
          </li>
          <li>
            <ExternalLink href="https://portal.productboard.com/ltulbdlwnurf2accjn3ukkww">
              <span className="fa fa-tasks" />
              {' Feature Wishlist '}
            </ExternalLink>
          </li>
        </ul>
      </div>
    );
  },

  openSupportModal(e) {
    contactSupport({type: 'project'});
    e.preventDefault();
    e.stopPropagation();
  },
});
