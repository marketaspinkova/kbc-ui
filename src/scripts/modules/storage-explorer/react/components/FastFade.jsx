import React from 'react';
import { Fade } from 'react-bootstrap';

export default React.createClass({
  render() {
    return <Fade {...this.props} className="fast-fade" timeout={100} />;
  }
});
