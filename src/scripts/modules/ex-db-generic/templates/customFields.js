const noLockField = {
  label: 'WITH NO LOCK',
  name: 'nolock',
  type: 'checkbox',
  protected: false,
  required: false,
  help: 'Use WITH(NOLOCK) for query execution',
  showInAdvancedMode: false
};

const ALL_FIELDS = [
  noLockField
];

const CUSTOM_FIELDS = {
  'keboola.ex-db-mssql': [
    noLockField
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
