import keyMirror from 'fbjs/lib/keyMirror';

export default keyMirror({
  // loads each time
  NO_CACHE: null,
  // loads once for each row
  ROW: null,
  // loads once for each row version
  ROW_VERSION: null,
  // loads once for each config
  CONFIGURATION: null,
  // loads once for each config version
  CONFIGURATION_VERSION: null
});
