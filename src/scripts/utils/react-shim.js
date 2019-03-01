
// keboola namespace for react components https://github.com/facebook/react/issues/1939
import DOMProperty from 'react/lib/DOMProperty';

if (process.env.NODE_ENV === 'production') {
  DOMProperty.ID_ATTRIBUTE_NAME = 'data-keboolaid';
}

require('react');
