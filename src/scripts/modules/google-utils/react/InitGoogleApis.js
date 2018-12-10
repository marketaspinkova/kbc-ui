import _ from 'underscore';
import {GapiActions} from './GapiFlux';
const apiUrl = 'https://apis.google.com/js/client.js?onload=handleGoogleClientLoad';

const CLIENT_ID_DEV = '1025566943657-ghlgrv82r1udfhaat36o5bdf65s4lne0.apps.googleusercontent.com';
const CLIENT_ID_PROD = '1025566943657-rh86466m7j8j9hpd75hu066ld0tul7re.apps.googleusercontent.com';

const API_KEY_DEV = 'AIzaSyDe04r2QjakVWKsPfSDAtRO27cZ4KPwafI';
const API_KEY_PROD = 'AIzaSyCgPtaSpWrqqmUBIyH44Q6flZaXO9cdr-4';

const getClientId = () => {
  if (process.env.NODE_ENV === 'development') {
    return CLIENT_ID_DEV;
  }
  return CLIENT_ID_PROD;
};

const getApiKey = () => {
  if (process.env.NODE_ENV === 'development') {
    return API_KEY_DEV;
  }
  return API_KEY_PROD;
};

let gapi;


if (!window.handleGoogleClientLoad) {
  window.handleGoogleClientLoad = function() {
    GapiActions.startInit();
    gapi = window.gapi;
    gapi.load('picker');
    gapi.load('auth', () => GapiActions.finishInit());
  };
}

export function authorize(scope, callBackFn, userEmail) {
  const signInOptions = {
    'client_id': getClientId(),
    'scope': [].concat(scope).join(' '),
    'cookie_policy': 'single_host_origin',
    'user_id': userEmail, // forces to log in specific email
    'prompt': 'select_account' // forces to always select account(no cached selection)
  };
  return gapi.auth.authorize(signInOptions, callBackFn);
}

export function disconnect() {
  gapi.auth.signOut();
  gapi.auth.setToken(null);
}

/*
function authorize(scope, email, callbackFn) {
  return gapi.auth.authorize(
    {
      'client_id': clientId,
      'scope': scope,
      'immediate': false,
      'user_id': email
    }
    , callbackFn);
}

export function authorizeGoogleAccount(scope, email, callbackFn, preloadPromise) {
  if (preloadPromise) {
    return preloadPromise.then(() => authorize(scope, email, callbackFn));
  } else {
    return authorize(scope, email, callbackFn);
  }
}

*/


export function injectGapiScript() {
  const scripts = document.body.getElementsByTagName('script');
  const apiScript = _.find(scripts, (s) =>
    s.src === apiUrl
  );
  if (!apiScript && _.isUndefined(window.gapi)) {
    let script = document.createElement('script');
    script.src = apiUrl;
    document.body.appendChild(script);
  }
}

export default function() {
  return window.gapi;
}

export const apiKey = getApiKey();
