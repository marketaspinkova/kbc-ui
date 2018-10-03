import React, { PropTypes } from 'react';

const LoadTypeSectionTitle = ({ value }) => (
  <span>
    Load Type: {!value.incremental ? 'Full Load' : 'Incremental Load'}
    {value.grain.length > 0 && ' with fact grain'}
  </span>
);

LoadTypeSectionTitle.propTypes = {
  value: PropTypes.object
};

export default LoadTypeSectionTitle;
