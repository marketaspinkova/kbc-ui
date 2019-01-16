import Immutable from 'immutable';

export default (current, all) => {
  let conflicts = Immutable.List();

  // self conflicts
  current.get('output', Immutable.List()).forEach((outputMapping, index) => {
    current.get('output', Immutable.List()).forEach((comparedOutputMapping, comparedIndex) => {
      if (outputMapping.get('destination') === comparedOutputMapping.get('destination') && index !== comparedIndex) {
        conflicts = conflicts.push(Immutable.fromJS({
          id: current.get('id'),
          destination: outputMapping.get('destination')
        }));
      }
    });
  });

  // sibling conflicts
  const siblings = all.filter((possibleSibling) => {
    return possibleSibling.get('phase') === current.get('phase') && possibleSibling.get('id') !== current.get('id');
  }).toList();

  siblings.forEach((sibling) => {
    sibling.get('output', Immutable.List()).forEach((siblingOutputMapping) => {
      current.get('output', Immutable.List()).forEach((currentOutputMapping) => {
        if (siblingOutputMapping.get('destination') === currentOutputMapping.get('destination')) {
          conflicts = conflicts.push(Immutable.fromJS({
            id: sibling.get('id'),
            destination: siblingOutputMapping.get('destination')
          }));
        }
      });
    });
  });

  // return deduplicated
  return conflicts.groupBy((conflict) => {
    return conflict.hashCode();
  }).map((groupedConflicts) => {
    return groupedConflicts.first();
  }).toList();
};
