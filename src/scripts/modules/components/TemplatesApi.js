import request from '../../utils/request';

export default {
  getTemplate(componentId) {
    return request('GET', `https://2aom76uwth.execute-api.us-east-1.amazonaws.com/prod/schemas/${componentId}`)
      .promise()
      .then(response => response.body);
  }
};
