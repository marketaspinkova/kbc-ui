import ApplicationStore from '../stores/ApplicationStore';
import success from '../../media/success.mp3';
import crash from '../../media/crash.mp3';

const paths = {
  success,
  crash
};

const soundElements = {};

const getSoundElement = name => {
  if (!soundElements[name]) {
    soundElements[name] = new Audio(ApplicationStore.getScriptsBasePath() + paths[name]);
  }
  return soundElements[name];
};

export default {
  success() {
    return getSoundElement('success').play();
  },
  crash() {
    return getSoundElement('crash').play();
  }
};
