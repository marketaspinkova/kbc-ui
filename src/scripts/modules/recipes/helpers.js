export const replaceTemplateVariables = (template, variables) => {
  let modifiedTemplate = JSON.stringify(template);
  Object.keys(variables).forEach((variableName) => {
    modifiedTemplate = modifiedTemplate
      .replace(new RegExp('{{' + variableName + '}}', 'g'), variables[variableName]);
  });
  return JSON.parse(modifiedTemplate);
};
