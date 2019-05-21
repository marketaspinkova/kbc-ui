const findUsages = (transformation, data) => {
  const sources = transformation
    .get('input')
    .map((mapping) => mapping.get('source'))
    .toSet()
    .toList();

  return data
    .filter((row) => sources.includes(row.get('inputTable')))
    .toMap()
    .mapKeys((index, table) => table.get('inputTable'))
    .map((row) =>
      row.get('usedIn').sortBy((row) => {
        const bucket = row.get('configurationName').toLowerCase();
        const transformation = row.get('rowName').toLowerCase();
        return `${bucket} - ${transformation}`;
      })
    );
};

export default findUsages;
