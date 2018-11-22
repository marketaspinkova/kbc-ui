import React, {PropTypes} from 'react';
import moment from 'moment';

const TokenAge = ({token}) => {
  const dateString = token.get('refreshed');
  if (!dateString) {
    return <span />;
  }
  const refreshed = moment(dateString);
  const formattedDate = refreshed.format('YYYY-MM-DD HH:mm');
  return (
    <span title={formattedDate}>
      {refreshed.fromNow(false)}
    </span>
  );
};

TokenAge.propTypes = {
  token: PropTypes.object.isRequired
};

export default TokenAge;
