import api from './api';


export default {
  prepareProject(name, gdToken) {
    api.createProjectAndUser(name, gdToken);
  }
}
