import React from 'react';
import FileSize from '../../../../react/common/FileSize';

const TableSizeLabel = ({size}) => (
  size ? (<span className="label label-primary">
    <FileSize size={size}/>
  </span>) : (<span/>)
);

TableSizeLabel.propTypes = {
  size: React.PropTypes.number
};

export default TableSizeLabel;
