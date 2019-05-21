import { Map } from 'immutable';

const findMatches = (transformation, data, limit = 5) => {
  const sources = transformation
    .get('input')
    .map((mapping) => mapping.get('source'))
    .toSet()
    .toList();

  const tables = data
    .filter((row) => sources.includes(row.get('inputTable')))
    .map((row) => row.get('usedIn'));

  if (sources.count() > tables.count()) {
    return Map();
  }

  return tables
    .flatten(1)
    .filter((row) => row.get('rowId') !== transformation.get('id'))
    .groupBy((row) => row.get('rowId'))
    .filter((configuration) => configuration.count() === sources.count())
    .filter((configuration) => configuration.first().get('lastRunAt'))
    .sortBy((configuration) => {
      const lastRun = configuration.first().get('lastRunAt');
      return -1 * new Date(lastRun).getTime();
    })
    .sortBy((configuration) => {
      const status = configuration.first().get('lastRunStatus');
      if (status === 'success') return -1;
      if (status === 'error' || status === 'terminated') return 1;
      return 0;
    })
    .slice(0, limit);
};

export default findMatches;
