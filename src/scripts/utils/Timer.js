import _ from 'underscore';

/*
  Periodic tasks executor
*/
class Timer {
  constructor() {
    this._timers = [];
  }

  /*
    Will execute callback every `interval` seconds
  */
  poll(callback, options = {}) {
    const interval = options.interval || 30;

    if (!options.skipFirst) {
      this._runAction(callback);
    }

    return this._timers.push({
      callback,
      intervalId: setInterval(() => this._runAction(callback), 1000 * interval)
    });
  }

  /*
    Stop periodic execution of callback
  */
  stop(callback) {
    return (this._timers = _.filter(this._timers, timer => {
      if (timer.callback !== callback) {
        return true;
      }
      clearInterval(timer.intervalId);
      return false;
    }));
  }

  _runAction(callback) {
    return callback();
  }
}

export default new Timer();
