import React from 'react';
import PropTypes from 'prop-types';
import { HelpBlock, Button } from 'react-bootstrap';

const RefreshTables = ({ refresh }) => {
  return (
    <HelpBlock>
      Not seeing your newest tables?{' '}
      <Button bsStyle="link" className="btn-link-inline" onClick={refresh}>
        Reload
      </Button>{' '}
      the list of tables.
    </HelpBlock>
  );
};

RefreshTables.propTypes = {
  refresh: PropTypes.func.isRequired
};

export default RefreshTables;
