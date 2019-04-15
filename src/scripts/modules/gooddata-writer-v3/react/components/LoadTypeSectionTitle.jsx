import PropTypes from 'prop-types';
import React from 'react';
import changedSinceConstants from '../../../../react/common/changedSinceConstants';


const LoadTypeSectionTitle = ({ value }) => (
  <span>
    Load Type: {!value.changedSince ? 'Full Load' : (value.changedSince === changedSinceConstants.ADAPTIVE_VALUE ? 'Automatic Incremental Load' : 'Manual Incremental Load')}
    {value.grain.length > 0 && ' with fact grain'}
  </span>
);

LoadTypeSectionTitle.propTypes = {
  value: PropTypes.object
};

export default LoadTypeSectionTitle;
