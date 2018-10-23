import Promise from 'bluebird';
import parse from 'csv-parse';

export default csvText => Promise.promisify(parse)(csvText);
