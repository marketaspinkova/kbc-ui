import SyrupApi from '../components/SyrupComponentApi';

const createRequest = (method, path) => SyrupApi.createRequest('wr-google-drive', method, path);

export default {
  getFiles(configId) {
    return createRequest('GET', `files/${configId}`)
      .promise()
      .then((response) => response.body);
  },

  getAccount(configId) {
    return createRequest('GET', `accounts/${configId}`)
      .promise()
      .then((response) => response.body);
  },

  postFile(configId, file) {
    return createRequest('POST', `files/${configId}`)
      .send(file)
      .promise()
      .then((response) => response.body);
  },

  putFile(configId, fileId, file) {
    return createRequest('PUT', `files/${configId}/${fileId}`)
      .send(file)
      .promise()
      .then((response) => response.body);
  },

  deleteFile(configId, rowId) {
    return createRequest('DELETE', `files/${configId}/${rowId}`)
      .promise()
      .then((response) => response.body);
  },

  getFileInfo(configId, googleId) {
    return createRequest('GET', `remote-file/${configId}/${googleId}`)
      .promise()
      .then((response) => response.body);
  }
};
