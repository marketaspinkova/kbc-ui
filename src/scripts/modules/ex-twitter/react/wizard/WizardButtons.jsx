import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Loader} from '@keboola/indigo-ui';
import {Button} from 'react-bootstrap';
import DeleteConfigurationButton from '../../../components/react/components/DeleteConfigurationButton';

export default createReactClass({
  propTypes: {
    isSaving: PropTypes.bool,
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    previousAction: PropTypes.func,
    nextAction: PropTypes.func,
    nextActionEnabled: PropTypes.bool,
    saveAction: PropTypes.func
  },
  render() {
    return (
      <div>
        {this.props.isSaving ? <Loader/> : null}
        &nbsp;
        &nbsp;
        <DeleteConfigurationButton
          componentId={this.props.componentId}
          configId={this.props.configId}
        />
        {this.props.previousAction ?
          <Button
            bsStyle="link"
            style={{marginLeft: '10px'}}
            onClick={this.props.previousAction}
          >
            Previous
          </Button> : null
        }
        {this.props.nextAction ?
          <Button
            bsStyle="primary"
            style={{marginLeft: '10px'}}
            onClick={this.props.nextAction}
            disabled={!this.props.nextActionEnabled}
          >
            Continue
          </Button> : null
        }
        {this.props.saveAction ?
          <Button
            bsStyle="success"
            style={{marginLeft: '10px'}}
            onClick={this.props.saveAction}
          >
            Save
          </Button> : null
        }
      </div>
    );
  }
});
