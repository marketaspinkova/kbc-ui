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

const hasVersions = (backendType) => {
  return versions[backendType].filter((version) => {
    return version.until && moment(version.until).unix() > moment().unix();
  }).length > 0;
};

const getVersions = (backendType) => {
  return versions[backendType].filter((version) => {
    return !version.until || moment(version.until).unix() > moment().unix();
  });
};

export {
  hasVersions,
  getVersions
};
