import React from 'react';

export default React.createClass({

  getStateFromStores() {

    return {
    }
  },


  render() {
    return (
      <div className="container-fluid">
        <div className="col-md-9 kbc-main-content">
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            <ConfigurationRowDescription
              componentId={this.state.componentId}
              configId={this.state.configurationId}
              rowId={this.state.rowId}
            />
          </div>
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            {this.state.isJsonEditorOpen || !this.state.isParsableConfiguration
             ? this.renderJsonEditor()
             : this.renderForm()}
          </div>
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <ul className="nav nav-stacked">{this.renderActions()}</ul>
        </div>
      </div>
    );
  },

  renderActions() {

  }
});
