import React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'react-bootstrap';
import ApplicationStore from '../../../../stores/ApplicationStore';
import {
  FEATURE_UI_DEVEL_PREVIEW,
  FEATURE_EARLY_ADOPTER_PREVIEW
} from '../../../../constants/KbcConstants';

const TableUsagesLabel = ({ usages }) => {
  if (
    !ApplicationStore.hasCurrentAdminFeature(FEATURE_EARLY_ADOPTER_PREVIEW) &&
    !ApplicationStore.hasCurrentAdminFeature(FEATURE_UI_DEVEL_PREVIEW)
  ) {
    return null;
  }

  return (
    <Label bsStyle={usages > 0 ? 'info' : 'default'}>
      <i className="fa fa-fw fa-align-justify" /> {usages !== undefined ? usages : 'N/A'}
    </Label>
  );
};

TableUsagesLabel.propTypes = {
  usages: PropTypes.number
};

export default TableUsagesLabel;
