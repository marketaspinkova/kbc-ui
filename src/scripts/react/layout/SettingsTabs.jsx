import PropTypes from 'prop-types';
import React from 'react';
import ApplicationStore from '../../stores/ApplicationStore';
import {Link} from 'react-router';

const projectPageUrl = (path) => {
  return ApplicationStore.getProjectPageUrl(path);
};

const SettingsTabs = ({active}) => {
  const getClassName = (linkName) => active === linkName ? 'active' : null;
  return (
    <ul className="nav nav-tabs">
      <li role="presentation" className={getClassName('settings-users')}>
        <a href={projectPageUrl('settings-users')}>Users</a>
      </li>
      <li role="presentation" className={getClassName('settings')}>
        <a href={projectPageUrl('settings')}>Settings</a>
      </li>
      <li role="presentation" className={getClassName('tokens')}>
        <Link to="tokens">API Tokens</Link>
      </li>
      <li role="presentation" className={getClassName('settings-limits')}>
        <Link to="settings-limits">Limits</Link>
      </li>
      <li role="presentation" className={getClassName('settings-project-power')}>
        <Link to="settings-project-power">Project Power</Link>
      </li>
      <li role="presentation" className={getClassName('settings-trash')}>
        <Link to="settings-trash">Trash</Link>
      </li>
    </ul>
  );
};

SettingsTabs.propTypes = {
  active: PropTypes.string.isRequired
};

export default SettingsTabs;
