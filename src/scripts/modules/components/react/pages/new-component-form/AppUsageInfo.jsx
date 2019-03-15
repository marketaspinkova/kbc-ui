import PropTypes from 'prop-types';
import React from 'react';

import ComponentBadgeTable from '../../../../../react/common/ComponentBadgeTable';
import { getComponentBadges } from '../../../../../react/common/componentHelpers';

const AppUsageInfo = ({ component }) => {
  return (
    <div className="kbcLicenseTable">
      <ComponentBadgeTable badges={getComponentBadges(component)} />
    </div>
  );
};

AppUsageInfo.propTypes = {
  component: PropTypes.object.isRequired
};

export default AppUsageInfo;
