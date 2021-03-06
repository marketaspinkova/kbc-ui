/**
 * CodeMirror highlight mode
 * @param {string} backend Transformation backend
 * @param {string} type Transformation type
 * @return {string} Show details
 */
export default function(backend, type) {
  if (backend === 'redshift') {
    return 'text/x-sql';
  } else if (backend === 'snowflake') {
    return 'text/x-sfsql';
  } else if (backend === 'docker') {
    if (type === 'r') {
      return 'text/x-rsrc';
    }
    if (type === 'python') {
      return 'text/x-python';
    }
    if (type === 'openrefine') {
      return 'application/json';
    }
  }

  return null;
}
