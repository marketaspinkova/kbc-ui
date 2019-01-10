import Immutable from "immutable";

const getConflicts = (current, all) => {
  const siblings = all.filter((possibleSibling) => {
    return possibleSibling.get('phase') === current.get('phase') && possibleSibling.get('id') !== current.get('id')
  }).toList();
  let conflicts = Immutable.List();
  siblings.forEach((sibling) => {
    sibling.get('output', Immutable.List()).forEach((siblingOutputMapping) => {
      current.get('output', Immutable.List()).forEach((currentOutputMapping) => {
        if (siblingOutputMapping.get('destination') === currentOutputMapping.get('destination')) {
          conflicts = conflicts.push({
            id: sibling.get('id'),
            destination: siblingOutputMapping.get('destination')
          });
        }
      });
    });
  });
  return conflicts;
};


export {
  getConflicts
};
