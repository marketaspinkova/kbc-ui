import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';

const MarkedText = (props) => {
  if (!props.mark) {
    return <span>{props.source}</span>;
  }

  let parts = props.source.split(new RegExp('(' + _.escape(props.mark) + ')', 'gi'));

  for (let i = 1; i < parts.length; i += 2) {
    parts[i] = <mark key={i}>{parts[i]}</mark>;
  }

  return <span>{parts}</span>;
}

MarkedText.propTypes = {
  source: PropTypes.string.isRequired,
  mark: PropTypes.string
}

export default MarkedText;