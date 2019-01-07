import React from 'react';
import { Alert } from 'react-bootstrap';

export default () => {
  return (
    <Alert bsStyle="warning">
      You're not using latest version of transformation backend.
      {' '}Please set Backend Version to <code>Latest</code> version to keep environment up to date.
    </Alert>
  );
};
