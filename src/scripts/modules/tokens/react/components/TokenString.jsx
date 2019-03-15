import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Clipboard from '../../../../react/common/Clipboard';

const TokenString = ({token, sendTokenComponent}) => {
  const tokenString = token.get('token');
  return (
    <pre>
      <div>
        {tokenString}
      </div>
      <Clipboard text={tokenString} label="Copy token to clipboard"/>
      {sendTokenComponent}
    </pre>
  );
};

TokenString.propTypes = {
  token: PropTypes.object.isRequired,
  sendTokenComponent: PropTypes.any
};


export default TokenString;
