import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

const LoadTypeSectionTitle = ({ value }) => (
  <span>
    Load Type: {!value.changedSince ? 'Full Load' : 'Incremental Load'}
    {value.grain.length > 0 && ' with fact grain'}
  </span>
);

LoadTypeSectionTitle.propTypes = {
  value: PropTypes.object
};

export default LoadTypeSectionTitle;
