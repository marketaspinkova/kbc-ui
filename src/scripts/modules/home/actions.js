import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';
import dispatcher from '../../Dispatcher';
import { ActionTypes } from '../../constants/KbcConstants';

const createRequest = () => {
  return request('POST', '/admin/projects/edit-description');
};

const editProjectDescription = (description) => {
  const data = {
    projectId: ApplicationStore.getCurrentProjectId(),
    xsrf: ApplicationStore.getXsrfToken(),
    description
  };

  return createRequest()
    .type('form')
    .send(data)
    .promise()
    .then((response) => {
      dispatcher.handleViewAction({
        type: ActionTypes.PROJECT_CHANGE_DESCRIPTION_SUCCESS,
        project: response.body
      });
    });
};

export {
  editProjectDescription
};
