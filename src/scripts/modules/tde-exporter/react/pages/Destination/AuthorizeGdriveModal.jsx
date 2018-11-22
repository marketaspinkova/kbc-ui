import React from 'react';
import { Map } from 'immutable';
import { Modal, Button, ButtonToolbar } from 'react-bootstrap';
import AuthorizeAccount from '../../../../google-utils/react/AuthorizeAccount';
import ApplicationStore from '../../../../../stores/ApplicationStore';
import RouterStore from '../../../../../stores/RoutesStore';

export default React.createClass({
  propTypes: {
    localState: React.PropTypes.object,
    configId: React.PropTypes.string,
    updateLocalState: React.PropTypes.func
  },

  render() {
    const show = !!(this.props.localState && this.props.localState.get('show'));

    return (
      <Modal show={show} onHide={() => this.props.updateLocalState(Map())}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Authorize Google Drive Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>You are about to authorize a Google Drive account for offline access.</div>
        </Modal.Body>
        <AuthorizeAccount
          renderToForm={true}
          isGeneratingExtLink={false}
          generateExternalLinkFn={() => null}
          sendEmailFn={() => null}
          caption="Authorize"
          className="pull-right"
          componentName="wr-google-drive"
          isInstantOnly={true}
          refererUrl={this._getReferrer()}
          noConfig={true}
        >
          <Modal.Footer>
            <ButtonToolbar>
              <Button className="btn btn-link" onClick={() => this.props.updateLocalState(Map())}>
                Cancel
              </Button>
              <Button type="submit" className="btn btn-success">
                Authorize
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </AuthorizeAccount>
      </Modal>
    );
  },

  _getReferrer() {
    const origin = ApplicationStore.getSapiUrl();
    const url = RouterStore.getRouter().makeHref('tde-exporter-gdrive-redirect', { config: this.props.configId });
    return `${origin}${url}`;
  }
});
