import React from 'react';
import fileSize from 'filesize';

const FileSize = ({ size }) => {
  return <span>{size ? fileSize(size) : 'N/A'}</span>;
};

FileSize.propTypes = {
  size: React.PropTypes.number
};

export default FileSize;
