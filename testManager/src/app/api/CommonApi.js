import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;

export function getUsers(param) {
  const projectId = AppState.currentMenuType.id;
  if (param) {
    return axios.get(`/test/v1/user/${projectId}/users?param=${param}`);
  }
  return axios.get(`/test/v1/user/${projectId}/users`);
}
export function getUsers2(param) {
  const projectId = AppState.currentMenuType.id;
  if (param) {
    return axios.get(`/test/v1/user/${projectId}/users?param=${param}`);
  }
  return axios.get(`/test/v1/user/${projectId}/users`);
}
