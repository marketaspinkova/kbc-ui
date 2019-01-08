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
    },
    {
      label: '1.2.9 (R 3.5.0)',
      version: '1.2.9',
      until: '2019-01-30'
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

const dateFormat = 'YYYY-MM-DD';

const hasVersions = (backendType, date = null) => {
  if (!versions[backendType]) {
    return false;
  }
  const unixTimestamp = date ? moment(date, dateFormat).unix() : moment().unix();
  return versions[backendType].filter((version) => {
    return version.version !== '' && moment(version.until, dateFormat).unix() > unixTimestamp;
  }).length > 0;
};

const getVersions = (backendType, date = null) => {
  if (!versions[backendType]) {
    return [];
  }
  const unixTimestamp = date ? moment(date, dateFormat).unix() : moment().unix();
  return versions[backendType].filter((version) => {
    return version.version === '' || moment(version.until, dateFormat).unix() > unixTimestamp;
  });
};

export {
  hasVersions,
  getVersions
};
