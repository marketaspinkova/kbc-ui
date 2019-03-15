import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

const TransformationTableTypeLabel = ({ backend }) => {
  if (backend === 'docker') {
    return <span className="fa fa-file-text-o fa-fw" title="File" />;
  }

  return <span className="fa fa-table fa-fw" title="Table" />;
};

TransformationTableTypeLabel.propTypes = {
  backend: PropTypes.string.isRequired
};

export default TransformationTableTypeLabel;
