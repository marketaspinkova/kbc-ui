var isObject = function(val) {
  if (val === null) { return false;}
  return ( (typeof val === 'function') || (typeof val === 'object') );
};

var preferEncryptedAttributesFromObject = function(data) {
  var keys = Object.keys(data);
  keys.forEach(function(key) {
    var plainKey = (key.substr(0, 1) === '#') ? key.substr(1) : key;
    var encryptedKey = (key.substr(0, 1) === '#') ? key : '#' + key;

    if (key.substr(0, 1) === '#') {
      if (data[key] !== '' && data[key] !== null && (data[plainKey])) {
        // try to delete plain value if encrypted value is not empty/null
        delete data[plainKey];
      } else if (data[plainKey]) {
        // try to replace empty/null encrypted value by plain value if exists
        data[key] = data[plainKey];
        delete data[plainKey];
      }
    } else if (data[encryptedKey] && data[encryptedKey] !== null && data[encryptedKey] !== '') {
      // delete plain value if encrypted exists and is not empty/null
      delete data[key];
    }

    if (isObject(data[key])) {
      preferEncryptedAttributesFromObject(data[key]);
    } else if (Array.isArray(data[key])) {
      preferEncryptedAttributesFromArray(data[key]);
    }
  });
};

var preferEncryptedAttributesFromArray = function(data) {
  data.forEach(function(item) {
    if (isObject(item)) {
      preferEncryptedAttributesFromObject(item);
    }
    if (Array.isArray(item)) {
      preferEncryptedAttributesFromArray(item);
    }
  });
};

export default function(configuration) {
  if (isObject(configuration)) {
    preferEncryptedAttributesFromObject(configuration);
  } else if (Array.isArray(configuration)) {
    preferEncryptedAttributesFromArray(configuration);
  }
  return configuration;
}
