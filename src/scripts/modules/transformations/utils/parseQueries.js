import Promise from 'bluebird';

const maxSqlExecutionTime = 2000;

export default function(queries) {
  return new Promise(function(resolve, reject) {
    const worker = require('worker-loader?inline!./splitSqlQueriesWorker.js')();
    let success = false;
    worker.onmessage = function(e) {
      // splited queries should be same as original 
      if (e.data === null || queries !== e.data.join('')) {
        reject(new Error('Query is not valid')); // immediately
        return;
      }
      success = true;
      resolve(e.data.map((query) => query.trim()).filter(Boolean));
    };
    worker.postMessage({
      queries: queries
    });
    setTimeout(function() {
      if (!success) {
        reject(new Error('Queries parsing timeout'));
      }
      worker.terminate();
    }, maxSqlExecutionTime);
  });
}
