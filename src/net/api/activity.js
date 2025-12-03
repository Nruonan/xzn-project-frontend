import {get, post} from "@/net/index.js";

/**
 * 活动相关API接口 - 客户端访问
 */

/**
 * 获取最新活动
 */
export const getLatestActivity = (success) => {
  return get('/api/activity/latest', success);
};

/**
 * 获取活动详情
 * @param id 活动ID
 */
export const getActivityDetail = (id, success) => {
  return get(`/api/activity/detail?id=${id}`, success);
};

/**
 * 获取活动列表（分页）
 * @param pageNum 页码，默认为1
 * @param pageSize 每页大小，默认为10
 * @param title 活动标题（可选）
 */
export const getActivityList = (pageNum = 1, pageSize = 10, title, success) => {
  const titleParam = title ? `&title=${title}` : '';
  return get(`/api/activity/list?pageNum=${pageNum}&pageSize=${pageSize}${titleParam}`, success);
};

/**
 * 活动相关API接口 - 管理员访问
 */

/**
 * 创建活动
 * @param data 活动创建请求数据
 */
export const createActivity = (data, success) => {
  return post('/api/admin/activity/create', data,success);
};

/**
 * 更新活动
 * @param data 活动更新请求数据
 */
export const updateActivity = (data, success) => {
  return post('/api/admin/activity/update', data, success);
};

/**
 * 删除活动
 * @param id 活动ID
 */
export const deleteActivity = (id, success) =>
    get(`/api/admin/activity/delete?id=${id}`, success);

/**
 * 获取活动列表（分页）- 管理员
 * @param pageNum 页码，默认为1
 * @param pageSize 每页大小，默认为10
 * @param title 活动标题（可选）
 */
export const getActivityListAdmin = (pageNum = 1, pageSize = 10, title, success) => {
  const titleParam = title ? `&title=${title}` : '';
  return get(`/api/admin/activity/list?pageNum=${pageNum}&pageSize=${pageSize}${titleParam}`, success);
};

/**
 * 获取单个活动详情 - 管理员
 * @param id 活动ID
 */
export const getActivityDetailAdmin = (id, success) => {
  return get(`/api/admin/activity/detail?id=${id}`, success);
};