import React from 'react';

const ConnectToMySqlSandbox = ({ credentials, children }) => {
  return (
    <form method="post" action="https://adminer.keboola.com" target="_blank">
      <input type="hidden" name="auth[driver]" value="server" />
      <input type="hidden" name="auth[server]" value={credentials.get('hostname')} />
      <input type="hidden" name="auth[username]" value={credentials.get('user')} />
      <input type="hidden" name="auth[db]" value={credentials.get('db')} />
      <input type="hidden" name="auth[password]" value={credentials.get('password')} />
      {children}
    </form>
  );
};

ConnectToMySqlSandbox.propTypes = {
  credentials: React.PropTypes.object.isRequired,
  children: React.PropTypes.any
};

export default ConnectToMySqlSandbox;
