import React from 'react';
import CodeEditor from '../../../../react/common/CodeEditor';
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
            <SapiTableLinkEx tableId={query.get('outputTable')}>
              <div className="form-control-static col-md-12">{query.get('outputTable')}</div>
            </SapiTableLinkEx>
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
          <label className="col-md-12 control-label">SQL query</label>
          <div className="col-md-12">
            {query.get('query').length ? (
              <CodeEditor
                readOnly={true}
                lineNumbers={false}
                value={query.get('query')}
                mode={editorMode(componentId)}
                style={{ width: '100%' }}
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
  );
};

QueryDetailStatic.propTypes = {
  query: React.PropTypes.object.isRequired,
  componentId: React.PropTypes.string.isRequired
};

export default QueryDetailStatic;
