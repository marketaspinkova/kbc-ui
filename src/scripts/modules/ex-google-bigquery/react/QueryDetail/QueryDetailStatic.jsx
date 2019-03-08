import React from 'react';
import CodeMirror from 'react-code-mirror';
import SapiTableLinkEx from '../../../components/react/components/StorageApiTableLinkEx';
import editorMode from '../../../ex-db-generic/templates/editorMode';

const QueryDetailStatic = ({ query, componentId }) => {
  return (
    <div className="row">
      <div className="form-horizontal">
        <div className="form-group">
          <label className="col-md-2 control-label">Name</label>
          <div className="col-md-4">
            <input
              className="form-control"
              type="text"
              value={query.get('name')}
              placeholder="Untitled Query"
              disabled={true}
            />
          </div>
          <label className="col-md-2 control-label">Primary key</label>
          <div className="col-md-4">
            <input
              className="form-control"
              type="text"
              value={query.get('primaryKey', []).join(', ')}
              placeholder="No primary key"
              disabled={true}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="col-md-2 control-label">Output table</label>
          <div className="col-md-4">
            <div className="form-control-static">
              <SapiTableLinkEx tableId={query.get('outputTable')}>
                {query.get('outputTable')}
              </SapiTableLinkEx>
            </div>
          </div>
          <div className="col-md-4 col-md-offset-2 checkbox">
            <label>
              <input type="checkbox" checked={query.get('incremental')} disabled={true} />
              Incremental
            </label>
          </div>
        </div>
        <div className="form-group">
          <label className="col-md-2 control-label" />
          <div className="col-md-10 checkbox">
            <label>
              <input type="checkbox" checked={query.get('useLegacySql')} disabled={true} />
              Use Legacy SQL
            </label>
          </div>
        </div>
        <div className="form-group">
          <label className="col-md-2 control-label">SQL query</label>
          <div className="col-md-10">
            <div className="form-control-static">
              {query.get('query').length ? (
                <CodeMirror
                  theme="solarized"
                  mode={editorMode(componentId)}
                  value={query.get('query')}
                  lineNumbers={false}
                  lineWrapping={false}
                  readOnly
                  style={{width: '100%'}}
                />
              ) : (
                <div className="row kbc-header">
                  <p className="text-muted">SQL query not set.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

QueryDetailStatic.propTypes = {
  query: React.PropTypes.object.isRequired,
  componentId: React.PropTypes.string.isRequired
};

export default QueryDetailStatic;
