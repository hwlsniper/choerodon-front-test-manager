/*
 * @Author: LainCarl 
 * @Date: 2018-11-01 14:56:06 
 * @Last Modified by: LainCarl
 * @Last Modified time: 2018-11-01 15:25:27
 * @Feature:  
 */

import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;

/**
 *创建issue
 *
 * @export
 * @param {*} issueObj
 * @param {*} folderId
 * @returns
 */
export function createIssue(issueObj, folderId) {
  const projectId = AppState.currentMenuType.id;
  const issue = {
    projectId,
    ...issueObj,
  };
  const versionId = issue.versionIssueRelDTOList[0].versionId;
  return axios.post(`/test/v1/projects/${projectId}/issueFolderRel/testAndRelationship?versionId=${versionId}${folderId ? `&folderId=${folderId}` : ''}`, issue);
}
export function createCommit(commitObj, projectId = AppState.currentMenuType.id) {
  return axios.post(`/agile/v1/projects/${projectId}/issue_comment`, commitObj);
}

export function updateCommit(commitObj, projectId = AppState.currentMenuType.id) {
  return axios.post(`/agile/v1/projects/${projectId}/issue_comment/update`, commitObj);
}

export function deleteCommit(commitId, projectId = AppState.currentMenuType.id) {
  return axios.delete(`/agile/v1/projects/${projectId}/issue_comment/${commitId}`);
}

export function loadStatus(statusId, issueId, typeId) {
  const projectId = AppState.currentMenuType.id;
  return axios.get(
    `/issue/v1/projects/${projectId}/schemes/query_transforms?current_status_id=${statusId}&issue_id=${issueId}&issue_type_id=${typeId}&scheme_type=agile`,
  );
}
export function loadIssue(issueId, projectId = AppState.currentMenuType.id) {
  const { organizationId } = AppState.currentMenuType;
  return axios.get(`/agile/v1/projects/${projectId}/issues/${issueId}?organizationId=${organizationId}`);
}
export function updateStatus(transformId, issueId, objVerNum, proId = AppState.currentMenuType.id) {
  return axios.put(`/agile/v1/projects/${proId}/issues/update_status?transformId=${transformId}&issueId=${issueId}&objectVersionNumber=${objVerNum}`);
}
export function updateIssue(data, projectId = AppState.currentMenuType.id) {
  return axios.put(`/agile/v1/projects/${projectId}/issues`, data);
}

export function deleteIssue(issueId, projectId = AppState.currentMenuType.id) {
  return axios.delete(`/agile/v1/projects/${projectId}/issues/${issueId}`);
}

export function deleteLink(issueLinkId, projectId = AppState.currentMenuType.id) {
  return axios.delete(`/agile/v1/projects/${projectId}/issue_links/${issueLinkId}`);
}

export function loadDatalogs(issueId, projectId = AppState.currentMenuType.id) {
  return axios.get(`agile/v1/projects/${projectId}/data_log?issueId=${issueId}`);
}

export function loadIssuesInLink(page = 0, size = 10, issueId, content) {
  const projectId = AppState.currentMenuType.id;
  if (content) {
    return axios.get(`/agile/v1/projects/${projectId}/issues/summary?issueId=${issueId}&self=false&content=${content}&page=${page}&size=${size}&onlyActiveSprint=false`);
  } else {
    return axios.get(`/agile/v1/projects/${projectId}/issues/summary?issueId=${issueId}&self=false&page=${page}&size=${size}&onlyActiveSprint=false`);
  }
}

export function createLink(issueId, issueLinkCreateDTOList) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/agile/v1/projects/${projectId}/issue_links/${issueId}`, issueLinkCreateDTOList);
}
// 需要更新
export function loadLinkIssues(issueId) {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`/agile/v1/projects/${projectId}/issue_links/${issueId}`);
}
export function getIssueTree() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`/test/v1/projects/${projectId}/issueFolder/query`);
}
export function addFolder(data) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/issueFolder`, data);
}
export function editFolder(data) {
  const projectId = AppState.currentMenuType.id;
  return axios.put(`/test/v1/projects/${projectId}/issueFolder/update`, data);
}
export function deleteFolder(folderId) {
  const projectId = AppState.currentMenuType.id;
  return axios.delete(`/test/v1/projects/${projectId}/issueFolder/${folderId}`);
}
/**
 *获取单个issue,地址栏跳转情况
 *
 * @export
 * @param {number} [page=0]
 * @param {number} [size=10]
 * @param {*} search
 * @param {*} orderField
 * @param {*} orderType
 * @returns
 */
export function getSingleIssues(page = 0, size = 10, search, orderField, orderType) {
  // console.log(search);
  const searchDTO = { ...search };
  searchDTO.advancedSearchArgs.typeCode = ['issue_test'];
  const { id: projectId, organizationId } = AppState.currentMenuType;
  return axios.post(`/test/v1/projects/${projectId}/issueFolderRel/query?page=${page}&size=${size}&organizationId=${organizationId}`, { versionIds: [], searchDTO }, {
    params: {
      sort: `${orderField && orderType ? `${orderField},${orderType}` : ''}`,
    },
  });
}
export function getAllIssues(page = 0, size = 10, search, orderField, orderType) {
  // console.log(search);
  const searchDTO = { ...search, otherArgs: search.searchArgs };
  searchDTO.advancedSearchArgs.typeCode = ['issue_test'];
  const { id: projectId, organizationId } = AppState.currentMenuType;
  return axios.post(`/test/v1/projects/${projectId}/issueFolderRel/query?page=${page}&size=${size}&organizationId=${organizationId}`, { versionIds: [], searchDTO }, {
    params: {
      sort: `${orderField && orderType ? `${orderField},${orderType}` : ''}`,
    },
  });
}
export function getIssuesByFolder(folderId, page = 0, size = 10, search, orderField, orderType) {
  const searchDTO = { ...search, otherArgs: search.searchArgs };
  searchDTO.advancedSearchArgs.typeCode = ['issue_test'];
  const { id: projectId, organizationId } = AppState.currentMenuType;
  return axios.post(`/test/v1/projects/${projectId}/issueFolderRel/query?folderId=${folderId}&page=${page}&size=${size}&organizationId=${organizationId}`, { versionIds: [], searchDTO }, {
    params: {
      sort: `${orderField && orderType ? `${orderField},${orderType}` : ''}`,
    },
  });
}
export function getIssuesByVersion(versionIds, page = 0, size = 10, search, orderField, orderType) {
  const searchDTO = { ...search, otherArgs: search.searchArgs };
  searchDTO.advancedSearchArgs.typeCode = ['issue_test'];
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/issueFolderRel/query?page=${page}&size=${size}`, { versionIds, searchDTO }, {
    params: {
      sort: `${orderField && orderType ? `${orderField},${orderType}` : ''}`,
    },
  });
}
export function getIssuesByIds(versionId, folderId, ids) {
  const { id: projectId, organizationId } = AppState.currentMenuType;
  return axios.post(`/test/v1/projects/${projectId}/issueFolderRel/query/by/issueId${versionId ? `?versionId=${versionId}` : ''}&organizationId=${organizationId}${folderId ? `&folderId=${folderId}` : ''}`, ids);
}
export function moveIssues(versionId, folderId, issueLinks) {
  const projectId = AppState.currentMenuType.id;
  return axios.put(`/test/v1/projects/${projectId}/issueFolderRel/move?versionId=${versionId}&folderId=${folderId}`, issueLinks);
}
export function copyIssues(versionId, folderId, issueLinks) {
  const projectId = AppState.currentMenuType.id;
  return axios.put(`/test/v1/projects/${projectId}/issueFolderRel/copy?versionId=${versionId}&folderId=${folderId}`, issueLinks);
}
export function moveFolders(data) {
  const projectId = AppState.currentMenuType.id;
  return axios.put(`/test/v1/projects/${projectId}/issueFolder/move`, data);
}
export function copyFolders(data, versionId) {
  const projectId = AppState.currentMenuType.id;
  const folderIds = data.map(item => item.folderId);
  return axios.put(`/test/v1/projects/${projectId}/issueFolder/copy?versionId=${versionId}`, folderIds);
}

export function getFoldersByVersion(versionId) {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`/test/v1/projects/${projectId}/issueFolder/query/all${versionId ? `?versionId=${versionId}` : ''}`);
}

export function syncFoldersInVersion(versionId) {
  // cycleId || versionId
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/cycle/synchro/folder/all/in/version/${versionId}`);
}
export function syncFoldersInCycle(cycleId) {
  // cycleId || versionId
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/cycle/synchro/folder/all/in/cycle/${cycleId}`);
}

export function syncFolder(folderId, cycleId) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/cycle/synchro/folder/${folderId}/in/${cycleId}`);
}
export function cloneIssue(issueId, copyConditionDTO) {
  const projectId = AppState.currentMenuType.id;
  return axios.put(`/test/v1/projects/${projectId}/issueFolderRel/copy/issue/${issueId}`, copyConditionDTO);
}
export function exportIssues() {
  const { id: projectId, organizationId } = AppState.currentMenuType;
  return axios.get(`/zuul/test/v1/projects/${projectId}/case/download/excel&organizationId=${organizationId}`);
}
export function exportIssuesFromVersion(versionId) {
  const { id: projectId, organizationId } = AppState.currentMenuType;
  return axios.get(`/zuul/test/v1/projects/${projectId}/case/download/excel/version?versionId=${versionId}&organizationId=${organizationId}`);
}
export function exportIssuesFromFolder(folderId) {
  const { id: projectId, organizationId } = AppState.currentMenuType;
  return axios.get(`/zuul/test/v1/projects/${projectId}/case/download/excel/folder?folderId=${folderId}&userId=${AppState.userInfo.id}&organizationId=${organizationId}`);
}
export function downloadTemplate() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`/zuul/test/v1/projects/${projectId}/case/download/excel/template`, { responseType: 'arraybuffer' });
}
export function getExportList() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`/test/v1/projects/${projectId}/test/fileload/history`);
}
