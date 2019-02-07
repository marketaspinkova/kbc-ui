import Immutable from 'immutable';

var mergeValueAndDefinition = function(compareKey, definitions, value) {
  if (definitions.size > 0) {
    var result = value;
    // add output mappings from definition
    definitions.forEach(function(definition) {
      if (result.filter(
        function(item) {
          return item.get(compareKey) === definition.get(compareKey);
        }).size === 0) {
        var itemToAdd = Immutable.fromJS({
          source: '',
          destination: ''
        });
        itemToAdd = itemToAdd.setIn([compareKey], definition.get(compareKey));
        result = result.push(itemToAdd);
      }
    });
    return result;
  }
  // no definition
  return value;
};

var findDefinition = function(compareKey, definitions, value) {
  return definitions.find(function(definition) {
    return definition.get(compareKey) === value.get(compareKey);
  }, null, Immutable.Map());
};

export default {
  getInputMappingValue: function(definitions, value) {
    return mergeValueAndDefinition('destination', definitions, value);
  },
  getOutputMappingValue: function(definitions, value) {
    return mergeValueAndDefinition('source', definitions, value);
  },
  findInputMappingDefinition: function(definitions, value) {
    return findDefinition('destination', definitions, value);
  },
  findOutputMappingDefinition: function(definitions, value) {
    return findDefinition('source', definitions, value);
  }
};
