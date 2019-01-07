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
      until: '2019-01-31'
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
      until: '2019-01-04'
    }
  ]
};

const hasVersions = (backendType, unixTimestamp) => {
  return versions[backendType].filter((version) => {
    return version.version !== '' && moment(version.until).unix() > unixTimestamp;
  }).length > 0;
};

const getVersions = (backendType, unixTimestamp) => {
  return versions[backendType].filter((version) => {
    return version.version === '' || moment(version.until).unix() > unixTimestamp;
  });
};

export {
  hasVersions,
  getVersions
};
