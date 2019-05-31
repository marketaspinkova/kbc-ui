const noLockField = {
  label: 'WITH NO LOCK',
  name: 'nolock',
  type: 'checkbox',
  protected: false,
  required: false,
  help: 'Use WITH(NOLOCK) for query execution',
  showInAdvancedMode: false
};

const disableFallbackField = {
  label: 'Disable Fallback',
  name: 'disableFallback',
  type: 'checkbox',
  protected: false,
  required: false,
  help: 'Disable the PDO fallback method on error',
  showInAdvancedMode: false
};

const ALL_FIELDS = [
  noLockField,
  disableFallbackField
];

const CUSTOM_FIELDS = {
  'keboola.ex-db-mssql': [
    noLockField,
    disableFallbackField
  ]
};

const getCustomFieldsForComponent = (componentId) => {
  if (!CUSTOM_FIELDS[componentId]) {
    return [];
  }
  return CUSTOM_FIELDS[componentId];
};

const getAllCustomFieldsNames = () => {
  return ALL_FIELDS.map((field) => {
    return field.name;
  });
};

export {
  getCustomFieldsForComponent,
  getAllCustomFieldsNames
};
