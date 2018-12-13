// given cardinal number as string or int function returns formated number with comma thousands separator
import React from 'react';
import {NotAvailable} from '@keboola/indigo-ui';

export default function(numberStr) {
  if (!numberStr && numberStr !== 0) {
    return <NotAvailable/>;
  }
  const number = parseInt(numberStr, 10);
  if (!number && number !== 0) {
    return <NotAvailable/>;
  }
  return number.toLocaleString('en-US');
}
