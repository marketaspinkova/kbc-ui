import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Input } from './../../../../react/common/KbcBootstrap';
import {Map} from 'immutable';
import ActionCreators from '../../ActionCreators';

import ConfirmButtons from '../../../../react/common/ConfirmButtons';

import ApplicationStore from '../../../../stores/ApplicationStore';

function prepareDataForCreate(data) {
  let newData = Map({
    name: data.get('name'),
    description: data.get('description')
  });

  switch (data.get('backend')) {
    case 'redshift':
      newData = newData.set('backend', 'redshift')
        .set('type', 'simple')
        .set('queries', [
          '-- This is a sample query.\n' +
          '-- Adjust accordingly to your input mapping, output mapping\n' +
          '-- and desired functionality.\n\n' +
          '-- CREATE TABLE "out_table" AS SELECT * FROM "in_table";'
        ]);
      break;
    case 'snowflake':
      newData = newData.set('backend', 'snowflake')
        .set('type', 'simple')
        .set('queries', [
          '-- This is a sample query.\n' +
          '-- Adjust accordingly to your input mapping, output mapping\n' +
          '-- and desired functionality.\n\n' +
          '-- CREATE TABLE "out_table" AS SELECT * FROM "in_table";'
        ]);
      break;
    case 'r':
      newData = newData.set('backend', 'docker')
        .set('type', 'r')
        .set('queries', [
          '# This is a sample script.\n' +
          '# Adjust accordingly to your input mapping, output mapping\n' +
          '# and desired functionality.\n\n' +
          '# input_data <- read.csv(file = "in/tables/input.csv");\n' +
          '# result <- input_data\n' +
          '# write.csv(result, file = "out/tables/output.csv", row.names = FALSE)'
        ]);
      break;
    case 'python':
      newData = newData.set('backend', 'docker')
        .set('type', 'python')
        .set('queries', [
          '# This is a sample script.\n' +
          '# Adjust accordingly to your input mapping, output mapping\n' +
          '# and desired functionality.\n\n' +
          '\'\'\'\n' +
          'import csv\n' +
          '\n' +
          'with open(\'in/tables/input.csv\', mode=\'rt\', encoding=\'utf-8\') as in_file, open(\'out/tables/output.csv\', mode=\'wt\', encoding=\'utf-8\') as out_file:\n' +
          '    lazy_lines = (line.replace(\'\\0\', \'\') for line in in_file)\n' +
          '    reader = csv.DictReader(lazy_lines, lineterminator=\'\\n\')\n' +
          '    writer = csv.DictWriter(out_file, fieldnames=reader.fieldnames, lineterminator=\'\\n\')\n' +
          '    writer.writeheader()\n' +
          '\n' +
          '    for row in reader:\n' +
          '        # do something and write row\n' +
          '        writer.writerow(row)' +
          '\n' +
          '\'\'\''
        ]);
      break;
    case 'openrefine':
      newData = newData.set('backend', 'docker').set('type', 'openrefine');
      break;

    default:
      throw new Error('Unknown backend ' + data.get('backend'));
  }

  return newData;
}

export default React.createClass({
  propTypes: {
    bucket: React.PropTypes.object.isRequired,
    type: React.PropTypes.string,
    label: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      type: 'link',
      label: ' New Transformation'
    };
  },

  getInitialState() {
    return {
      data: Map({
        isSaving: false,
        name: '',
        description: '',
        backend: ApplicationStore.getCurrentProject().get('defaultBackend')
      }),
      showModal: false
    };
  },

  open() {
    this.setState({
      showModal: true
    });
  },

  close() {
    this.setState({
      showModal: false
    });
  },

  renderModal() {
    return (
      <Modal onHide={this.close} show={this.state.showModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>
            New Transformation
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {this.form()}
        </Modal.Body>

        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.state.data.get('isSaving')}
            isDisabled={!this.isValid()}
            saveLabel="Create Transformation"
            onCancel={this.close}
            onSave={this.handleCreate}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  render() {
    if (this.props.type === 'button') {
      return (
        <Button onClick={this.handleOpenButtonClick} bsStyle="success">
          <i className="kbc-icon-plus" />{this.props.label}
          {this.renderModal()}
        </Button>
      );
    } else {
      return (
        <a onClick={this.handleOpenButtonClick}>
          <i className="kbc-icon-fw kbc-icon-plus" />{this.props.label}
          {this.renderModal()}
        </a>
      );
    }
  },

  handleOpenButtonClick(e) {
    e.preventDefault();
    this.open();
  },

  form() {
    return (
      <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <p className="help-block">
          Create new transformation in bucket <strong>{ this.props.bucket.get('name') }</strong>
        </p>
        <Input
          type="text"
          value={this.state.data.get('name')}
          autoFocus={true}
          onChange={this.handleChange.bind(this, 'name')}
          placeholder="Name"
          label="Name"
          ref="name"
          labelClassName="col-sm-4"
          wrapperClassName="col-sm-6"/>
        <Input
          type="textarea"
          value={this.state.data.get('description')}
          onChange={this.handleChange.bind(this, 'description')}
          placeholder="Description"
          label="Description"
          labelClassName="col-sm-4"
          wrapperClassName="col-sm-6"/>
        <Input
          type="select"
          label="Backend"
          value={this.state.data.get('backend')}
          onChange={this.handleChange.bind(this, 'backend')}
          labelClassName="col-sm-4"
          wrapperClassName="col-sm-6"
        >
          {this.backendOptions()}
        </Input>
      </form>
    );
  },

  backendOptions() {
    var options = [];
    options.push({value: 'snowflake', label: 'Snowflake'});
    if (ApplicationStore.getSapiToken().getIn(['owner', 'hasRedshift'], false)) {
      options.push({value: 'redshift', label: 'Redshift'});
    }
    options.push({value: 'r', label: 'R'});
    options.push({value: 'python', label: 'Python'});
    options.push({value: 'openrefine', label: 'OpenRefine (beta)'});
    return options.map(function(option) {
      return (
        <option value={option.value} key={option.value}>{option.label}</option>
      );
    });
  },


  isValid() {
    return this.state.data.get('name').length > 0;
  },

  handleChange(field, e) {
    this.setState({
      data: this.state.data.set(field, e.target.value)
    });
  },

  handleSubmit(e) {
    e.preventDefault();
    if (this.isValid()) {
      this.handleCreate();
    }
  },

  handleCreate() {
    this.setState({
      data: this.state.data.set('isSaving', true)
    });
    ActionCreators.createTransformation(this.props.bucket.get('id'), prepareDataForCreate(this.state.data))
      .then(this.close)
      .catch(() => {
        this.setState({
          data: this.state.data.set('isSaving', false)
        });
      });
  }

});
