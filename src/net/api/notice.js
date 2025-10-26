import {get, post} from "@/net/index.js";

/**
 * 公告相关API接口
 */

/**
 * 创建公告
 * @param data 公告创建请求数据
 */
export const createNotice = (data, success) => {
  return post('/api/admin/notice/create', data,success);
};

/**
 * 更新公告
 * @param data 公告更新请求数据
 */
export const updateNotice = (data, success) => {
  return post('/api/admin/notice/update', data, success);
};

/**
 * 删除公告
 * @param id 公告ID
 */
export const deleteNotice = (id, success) =>
    get(`/api/admin/notice/delete?id=${id}`, success);

/**
 * 获取公告列表（分页）
 * @param pageNum 页码，默认为1
 * @param pageSize 每页大小，默认为10
 */
export const getNoticeList = (pageNum = 1, pageSize = 10, searchTitle, success) => {
  return get(`/api/admin/notice/list?pageNum=${pageNum}&pageSize=${pageSize}&title=${searchTitle}`, success);
};

/**
 * 获取单个公告详情
 * @param id 公告ID
 */
export const getNoticeDetail = (id, success) => {
  return get(`/api/admin/notice/detail?id=${id}`, success);
};

/**
 * 获取公告列表
 */
export const getNoticeOne = (success) => {
  return get(`/api/notice/one`, success);
};

export const getApiNoticeDetail = (id, success) => {
  return get(`/api/notice/detail?id=${id}`, success);
};
