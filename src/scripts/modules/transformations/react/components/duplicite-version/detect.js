import Immutable from "immutable";

const getConflicts = (current, all) => {
  const siblings = all.filter((possibleSibling) => {
    return possibleSibling.get('phase') === current.get('phase') && possibleSibling.get('id') !== current.get('id')
  }).toList();
  const conflicts = siblings.filter((sibling) => {
    let isConflict = false;
    sibling.get('output', Immutable.List()).forEach((siblingOutputMapping) => {
      current.get('output', Immutable.List()).forEach((currentOutputMapping) => {
        if (siblingOutputMapping.get('destination') === currentOutputMapping.get('destination')) {
          isConflict = true;
        }
      });
    });
    return isConflict;
  });
  return conflicts.map((conflict) => {
    return conflict.get('id');
  }).toArray();
};


export {
  getConflicts
};
