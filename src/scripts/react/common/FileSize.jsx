import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import fileSize from 'filesize';

const options = {
  base: 10
};

const FileSize = ({ size }) => {
  return <span>{size ? fileSize(size, options) : 'N/A'}</span>;
};

FileSize.propTypes = {
  size: PropTypes.number
};

export default FileSize;
