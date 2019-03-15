import React from 'react';
import createReactClass from 'create-react-class';
import {Loader} from '@keboola/indigo-ui';

export default createReactClass({

  render() {
    return (
      <div className="text-center" style={{padding: '2em 0'}}>
        <Loader className="fa-2x"/>
      </div>
    );
  }

});
