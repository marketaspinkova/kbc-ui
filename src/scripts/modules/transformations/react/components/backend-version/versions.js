import moment from 'moment';

const versions = {
  r: [
    {
      label: 'Latest (recommended and up to date environment)',
      version: ''
    },
    {
      label: '1.2.8',
      version: '1.2.8',
      until: '2019-01-01'
    }
  ],
  python: [
    {
      label: 'Latest (recommended and up to date environment)',
      version: ''
    },
    {
      label: '1.1.9',
      version: '1.1.9',
      until: '2019-01-03'
    }
  ]
};

const hasVersions = (backendType, unixTimestamp) => {
  if (!versions[backendType]) {
    return false;
  }
  return versions[backendType].filter((version) => {
    return version.version !== '' && moment(version.until).unix() > unixTimestamp;
  }).length > 0;
};

const getVersions = (backendType, unixTimestamp) => {
  if (!versions[backendType]) {
    return [];
  }
  return versions[backendType].filter((version) => {
    return version.version === '' || moment(version.until).unix() > unixTimestamp;
  });
};

export {
  hasVersions,
  getVersions
};
