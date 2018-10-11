import React from 'react';

const TransformationTableTypeLabel = ({ backend }) => {
  if (backend === 'docker') {
    return <span className="fa fa-file-text-o fa-fw" title="File" />;
  }

  return <span className="fa fa-table fa-fw" title="Table" />;
};

TransformationTableTypeLabel.propTypes = {
  backend: React.PropTypes.string.isRequired
};

export default TransformationTableTypeLabel;
