import React from 'react';
import createReactClass from 'create-react-class';
import { Alert } from 'react-bootstrap';

export default () => {
  return (
    <Alert bsStyle="warning">
      You&apos;re not using latest version of transformation backend.
      {' '}Please set the backend version to <code>Latest</code> to keep environment up to date.
    </Alert>
  );
};
