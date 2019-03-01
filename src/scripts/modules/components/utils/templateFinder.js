import deepEqual from 'deep-equal';

export default function(templates, configuration) {
  return templates.filter(function(template) {
    var templateKeys, valid;

    valid = true;
    templateKeys = template.get('data').keySeq();

    // empty template
    if (templateKeys.count() === 0) {
      valid = false;
    }

    templateKeys.forEach(function(key) {
      // missing key
      if (!configuration.has(key)) {
        valid = false;
        return;
      }

      var configValue = configuration.get(key);
      var templateValue = template.getIn(['data', key]);

      // type mismatch
      if (typeof (configValue) !== typeof (templateValue)) {
        valid = false;
        return;
      }

      if (typeof (templateValue) === 'object' ) {
        // array type mismatch
        if (Array.isArray(templateValue.toJS()) !== Array.isArray(configValue.toJS())) {
          valid = false;
          return;
        }

        // nonequal objects
        if (!deepEqual(templateValue.toJS(), configValue.toJS())) {
          valid = false;
          return;
        }
      } else if (configValue !== templateValue) {
        // nonequal scalars
        valid = false;
        return;
      }
    });
    return valid;
  });
}
