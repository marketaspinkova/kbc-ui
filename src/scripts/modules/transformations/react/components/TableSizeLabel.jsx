import PropTypes from 'prop-types';
import React from 'react';
import FileSize from '../../../../react/common/FileSize';

const TableSizeLabel = ({ size }) => (
  <span className="label label-primary">
    <FileSize size={size} />
  </span>
);

TableSizeLabel.propTypes = {
  size: PropTypes.number
};

export default TableSizeLabel;
