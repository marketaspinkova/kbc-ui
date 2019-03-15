import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

const LoadTypeSectionTitle = ({ value }) => (
  <span> Load Type: {value.incremental === false ? 'Full Load' : 'Incremental Load'} </span>
);

LoadTypeSectionTitle.propTypes = {
  value: PropTypes.object
};

export default LoadTypeSectionTitle;
