import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import moment from 'moment';

const CreatedDate = ({token}) => {
  const created = moment(token.get('created'));
  const formattedDate =  created.format('YYYY-MM-DD HH:mm');
  return <span title={formattedDate}>{created.fromNow()}</span>;
};

CreatedDate.propTypes = {
  token: PropTypes.object.isRequired
};

export default CreatedDate;
