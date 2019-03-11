import React from 'react';
import moment from 'moment';
import ApplicationStore from '../../../../../stores/ApplicationStore';

export default (latestVersion) => {
  const creatorId = latestVersion.getIn(['creatorToken', 'id']);
  const currentAdminId = ApplicationStore.getCurrentAdmin().get('id');
  const createdByCurrentAdmin = parseInt(creatorId, 10) === parseInt(currentAdminId, 10);

  return React.createClass({
    render() {
      return (
        <div>
          <p>
            {'New configuration created by '}
            <b>
              {createdByCurrentAdmin ? 'you' : latestVersion.getIn(['creatorToken', 'description'])}{' '}
              {moment(latestVersion.get('created')).fromNow()}
            </b>
            {' was detected.'}
          </p>
          <p>
            {'Editing same configuration'}
            {createdByCurrentAdmin ? ' from multiple places ' : ' by several users '}
            {
              'is not supported. If you save the current configuration you may overwrite the latest changes.'
            }
          </p>
        </div>
      );
    }
  });
};
