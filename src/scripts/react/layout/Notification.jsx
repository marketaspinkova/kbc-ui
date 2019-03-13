import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-bootstrap';

const classMap = {
  success: 'info',
  error: 'danger'
};

function computeNotificationAge(notification) {
  return new Date().getTime() - notification.get('created').getTime();
}

export default React.createClass({
  propTypes: {
    notification: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
    onMouseEnter: PropTypes.func.isRequired,
    onMouseLeave: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      age: computeNotificationAge(this.props.notification)
    };
  },

  tick: function() {
    this.setState({
      age: computeNotificationAge(this.props.notification)
    });
  },
  componentDidMount: function() {
    this.interval = setInterval(this.tick, 100);
  },
  componentWillUnmount: function() {
    clearInterval(this.interval);
  },

  render() {
    const {notification} = this.props;
    const id = notification.get('id');

    return (
      <div onMouseEnter={ () => this.props.onMouseEnter(id)}
        onMouseLeave={ () => this.props.onMouseLeave(id)} >
        <Alert
          onDismiss={this.onCancel}
          bsStyle={classMap[notification.get('type')]}
          style={this.opacity()}
        >
          {this.renderNotificationBody(notification)}
        </Alert>
      </div>
    );
  },

  opacity() {
    const timeout = this.props.notification.get('timeout'),
      age = this.state.age,
      isPaused = this.props.notification.get('paused'),
      animationStartRatio = 0.6;
    if (age / timeout < animationStartRatio || isPaused) {
      return {
        opacity: 1
      };
    }

    const animationTime = Math.round((1 - animationStartRatio) * timeout);
    return {
      opacity: 0.4,
      transition: `opacity ${animationTime}ms ease-in`
    };
  },

  renderNotificationBody(notification) {
    if (typeof notification.get('message') === 'string') {
      return notification.get('message');
    }
    return React.createElement(notification.get('message'), {
      onClick: this.onCancel
    });
  },

  onCancel() {
    this.props.onCancel(this.props.notification.get('id'));
  }

});
