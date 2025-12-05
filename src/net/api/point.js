import {get, post} from "@/net/index.js";

/**
 * 积分相关API接口 - 客户端访问
 */

/**
 * 获取用户积分信息
 */
export const getUserPoints = (success) => {
  return get('/api/point/log/my-point', success);
};

/**
 * 获取用户积分统计信息
 * @param success 成功回调函数
 */
export const getPointStatistics = (success) => {
  return get('/api/user/point-statistics', success);
};

/**
 * 获取用户积分明细
 * @param pageNum 页码，默认为1
 * @param pageSize 每页大小，默认为10
 * @param type 积分类型（可选）
 */
export const getPointsLogList = (pageNum = 1, pageSize = 10, type, success) => {
  const queryParams = new URLSearchParams({
    pageNum: pageNum,
    pageSize: pageSize
  });
  
  if (type !== undefined && type !== null) {
    queryParams.append('type', type);
  }
  
  return get(`/api/point/log/list?${queryParams.toString()}`, success);
};

/**
 * 获取积分商品列表
 * @param pageNum 页码，默认为1
 * @param pageSize 每页大小，默认为10
 * @param searchText 搜索文本（可选）
 */
export const getPointsProductList = (pageNum = 1, pageSize = 10, searchText, success) => {
  const queryParams = new URLSearchParams({
    pageNum: pageNum,
    pageSize: pageSize
  });
  
  if (searchText) {
    queryParams.append('name', searchText);
  }
  
  return get(`/api/point/product/list?${queryParams.toString()}`, success);
};

/**
 * 创建积分订单
 * @param data 订单创建请求数据
 */
export const createPointsOrder = (data, success) => {
  return post('/api/point/order/create', data, success);
};

/**
 * 获取积分订单列表
 * @param pageNum 页码，默认为1
 * @param pageSize 每页大小，默认为10
 * @param status 订单状态（可选）
 * @param startDate 开始日期（可选）
 * @param endDate 结束日期（可选）
 */
export const getPointsOrderList = (pageNum = 1, pageSize = 10, status, startDate, endDate, success) => {
  const queryParams = new URLSearchParams({
    pageNum: pageNum,
    pageSize: pageSize
  });
  
  if (status) {
    if (status === "pending") {
      queryParams.append('status', 0);
    } else if (status === "shipped") {
      queryParams.append('status', 1);
    } else if (status === "completed") {
      queryParams.append('status', 2);
    }
  }
  
  if (startDate && endDate) {
    queryParams.append('startDate', startDate);
    queryParams.append('endDate', endDate);
  }
  
  return get(`/api/point/order/list?${queryParams.toString()}`, success);
};

/**
 * 获取积分订单详情
 * @param id 订单ID
 */
export const getPointsOrderDetail = (id, success) => {
  return get(`/api/point/order/detail?id=${id}`, success);
};

/**
 * 取消积分订单
 * @param id 订单ID
 */
export const cancelPointsOrder = (id, success) => {
  return post('/api/point/order/cancel', { id }, success);
};

/**
 * 积分相关API接口 - 管理员访问
 */

/**
 * 获取积分日志列表（管理员）
 * @param pageNum 页码，默认为1
 * @param pageSize 每页大小，默认为10
 * @param type 积分类型（可选）
 * @param startDate 开始日期（可选）
 * @param endDate 结束日期（可选）
 */
export const getPointsLogListAdmin = (pageNum = 1, pageSize = 10, type, startDate, endDate, success) => {
  const queryParams = new URLSearchParams({
    pageNum: pageNum,
    pageSize: pageSize
  });
  
  if (type) {
    queryParams.append('type', type);
  }
  
  if (startDate && endDate) {
    queryParams.append('startDate', startDate);
    queryParams.append('endDate', endDate);
  }
  
  return get(`/api/admin/point/log/list?${queryParams.toString()}`, success);
};

/**
 * 获取积分商品列表（管理员）
 * @param pageNum 页码，默认为1
 * @param pageSize 每页大小，默认为10
 * @param name 商品名称（可选）
 */
export const getPointsProductListAdmin = (pageNum = 1, pageSize = 10, name, success) => {
  const queryParams = new URLSearchParams({
    pageNum: pageNum,
    pageSize: pageSize
  });
  
  if (name) {
    queryParams.append('name', name);
  }
  
  return get(`/api/admin/point/product/list?${queryParams.toString()}`, success);
};

/**
 * 创建积分商品（管理员）
 * @param data 商品创建请求数据
 */
export const createPointsProduct = (data, success) => {
  return post('/api/admin/point/product/create', data, success);
};

/**
 * 创建积分商品（管理员）- 别名，保持与PointProductAdmin.vue导入一致
 * @param data 商品创建请求数据
 */
export const createPointsProductAdmin = createPointsProduct;

/**
 * 更新积分商品（管理员）
 * @param data 商品更新请求数据
 */
export const updatePointsProduct = (data, success) => {
  return post('/api/admin/point/product/update', data, success);
};

/**
 * 更新积分商品（管理员）- 别名，保持与PointProductAdmin.vue导入一致
 * @param data 商品更新请求数据
 */
export const updatePointsProductAdmin = updatePointsProduct;

/**
 * 删除积分商品（管理员）
 * @param id 商品ID
 */
export const deletePointsProduct = (id, success) => {
  return get(`/api/admin/point/product/delete?id=${id}`, success);
};

/**
 * 删除积分商品（管理员）- 别名，保持与PointProductAdmin.vue导入一致
 * @param id 商品ID
 */
export const deletePointsProductAdmin = deletePointsProduct;

/**
 * 获取积分订单列表（管理员）
 * @param pageNum 页码，默认为1
 * @param pageSize 每页大小，默认为10
 * @param status 订单状态（可选）
 * @param startDate 开始日期（可选）
 * @param endDate 结束日期（可选）
 */
export const getPointsOrderListAdmin = (pageNum = 1, pageSize = 10, status, name, success) => {
  const queryParams = new URLSearchParams({
    pageNum: pageNum,
    pageSize: pageSize
  });
  
  if (status) {
    queryParams.append('status', status);
  }
  
  if (name) {
    queryParams.append('name', name);
  }
  
  return get(`/api/admin/point/order/list?${queryParams.toString()}`, success);
};

/**
 * 更新积分订单状态（管理员）
 * @param data 订单状态更新请求数据
 */
export const updatePointsOrderStatus = (id, status, success) => {
  return get(`/api/admin/point/order/update-status?id=${id}&status=${status}`, success);
};

/**
 * 更新积分订单状态（管理员）- 别名，保持与PointOrderAdmin.vue导入一致
 * @param data 订单状态更新请求数据
 */
export const updatePointsOrderStatusAdmin = updatePointsOrderStatus;