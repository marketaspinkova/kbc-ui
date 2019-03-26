import React from 'react';
import createReactClass from 'create-react-class';
import { Fade } from 'react-bootstrap';

export default createReactClass({
  render() {
    return <Fade {...this.props} className="fast-fade" timeout={100} />;
  }
});
