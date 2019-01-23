import React from 'react';
import fileSize from 'filesize';

const options = {
  base: 10
};

const FileSize = ({ size }) => {
  return <span>{size ? fileSize(size, options) : 'N/A'}</span>;
};

FileSize.propTypes = {
  size: React.PropTypes.number
};

export default FileSize;
