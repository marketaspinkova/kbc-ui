import moment from 'moment';

const versions = {
  r: [
    {
      label: 'Latest (recommended and up-to-date environment)',
      version: ''
    },
    {
      label: '1.2.10 (R 3.5.2 without TCL/TK)',
      version: '1.2.10',
      until: '2019-02-01'
    },
    {
      label: '1.2.9 (R 3.5.0)',
      version: '1.2.9',
      until: '2019-01-30'
    },
    {
      label: '1.2.8',
      version: '1.2.8',
      until: '2019-01-01'
    }
  ],
  python: [
    {
      label: 'Latest (recommended and up-to-date environment)',
      version: ''
    },
    {
      label: '1.1.18 (Python 3.7.2 without TQDM)',
      version: '1.1.18',
      until: '2019-03-22'
    },    
    {
      label: '1.1.12 (Python 3.6.4)',
      version: '1.1.12',
      until: '2019-02-11'
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
