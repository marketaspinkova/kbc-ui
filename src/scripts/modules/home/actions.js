import request from '../../utils/request';
import ApplicationStore from '../../stores/ApplicationStore';
import dispatcher from '../../Dispatcher';
import { ActionTypes } from '../../constants/KbcConstants';

const createRequest = () => {
  return request('POST', '/admin/projects/edit-description');
};

const editProjectDescriptionRequest = (data) => {
  return createRequest()
    .type('form')
    .send(data)
    .promise()
    .then((response) => {
      return response.body;
    });
};

const editProjectDescription = (description) => {
  const data = {
    projectId: ApplicationStore.getCurrentProjectId(),
    xsrf: ApplicationStore.getXsrfToken(),
    description
  };

  return editProjectDescriptionRequest(data)
    .then((project) => {
      dispatcher.handleViewAction({
        type: ActionTypes.PROJECT_CHANGE_DESCRIPTION_SUCCESS,
        project
      });
      return project;
    })
    .catch((error) => {
      dispatcher.handleViewAction({
        type: ActionTypes.PROJECT_CHANGE_DESCRIPTION_ERROR
      });
      throw error;
    });
};

export {
  editProjectDescription
};
