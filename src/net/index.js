import axios from "axios";
import {ElMessage} from "element-plus";

const authItemName = "authorize"

// 刷新Token的锁，防止多个请求同时刷新
let isRefreshing = false
let refreshSubscribers = []

// 添加订阅者，等待Token刷新完成
function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback)
}

// 通知所有订阅者Token已刷新
function notifyRefreshSubscribers(token) {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

const accessHeader = () => {
  const token = takeAccessToken()?.access_token
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

const defaultError = (error) => {
  console.error(error)
  ElMessage.error('发生了一些错误，请联系管理员')
}

const defaultFailure = (message, status, url) => {
  console.warn(`请求地址: ${url}, 状态码: ${status}, 错误信息: ${message}`)
  ElMessage.warning(message)
}

function takeAccessToken() {
  const str = localStorage.getItem(authItemName) || sessionStorage.getItem(authItemName);
  if(!str) return null
  const authObj = JSON.parse(str)
  return authObj
}

// 检查Token是否即将过期（2小时内）
function isTokenExpiringSoon(expireTime) {
  const now = new Date().getTime()
  const expire = new Date(expireTime).getTime()
  const twoHours = 2 * 60 * 60 * 1000 // 2小时
  return expire - now < twoHours
}

// 刷新Token
async function refreshToken(refreshToken) {
  try {
    const response = await axios.get(`/api/auth/refresh?token=${refreshToken}`, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      }
    })
    
    if (response.data.code === 200 && response.data.data) {
      const { access_token, access_expire, refresh_token: newRefreshToken, role } = response.data.data
      const storage = localStorage.getItem(authItemName) ? localStorage : sessionStorage
      storeAccessToken(storage === localStorage, access_token, access_expire, newRefreshToken, role)
      return { success: true, access_token }
    } else {
      return { success: false, message: '刷新Token失败' }
    }
  } catch (error) {
    console.error('刷新Token错误:', error)
    return { success: false, message: '刷新Token请求失败' }
  }
}

// 检查并刷新Token
async function checkAndRefreshToken() {
  const authObj = takeAccessToken()
  if (!authObj) return false
  
  // 如果Token已经过期
  if (new Date(authObj.access_expire) <= new Date()) {
    deleteAccessToken()
    ElMessage.warning("登录状态已过期，请重新登录！")
    return false
  }
  
  // 如果Token即将过期，自动刷新
  if (isTokenExpiringSoon(authObj.access_expire)) {
    if (isRefreshing) {
      // 如果正在刷新，等待刷新完成
      return new Promise((resolve) => {
        addRefreshSubscriber((token) => {
          resolve(!!token)
        })
      })
    }
    
    isRefreshing = true
    const result = await refreshToken(authObj.refresh_token)
    isRefreshing = false
    
    if (result.success) {
      // 通知所有等待的请求
      notifyRefreshSubscribers(result.access_token)
      return true
    } else {
      // 刷新失败，清除认证信息
      deleteAccessToken()
      ElMessage.warning("登录状态已过期，请重新登录！")
      // 通知所有等待的请求刷新失败
      notifyRefreshSubscribers(null)
      return false
    }
  }
  
  return true
}

function storeAccessToken(remember, token, expire, refresh_token, role){
  const authObj = {
    access_token: token,
    access_expire: expire,
    refresh_token: refresh_token,
    role: role
  }
  const str = JSON.stringify(authObj)
  if(remember)
    localStorage.setItem(authItemName, str)
  else
    sessionStorage.setItem(authItemName, str)
}

function deleteAccessToken() {
  localStorage.removeItem(authItemName)
  sessionStorage.removeItem(authItemName)
}

// 设置请求拦截器
axios.interceptors.request.use(async (config) => {
  // 跳过刷新Token的请求，避免循环
  if (config.url.includes('/api/auth/refresh')) {
    return config
  }
  
  const authObj = takeAccessToken()
  if (!authObj) {
    return config
  }
  
  // 检查并刷新Token
  const tokenValid = await checkAndRefreshToken()
  if (!tokenValid) {
    // Token无效，跳转到登录页
    window.location.href = '/login'
    return Promise.reject(new Error('Token已过期'))
  }
  
  // 获取最新的Token
  const updatedAuthObj = takeAccessToken()
  if (updatedAuthObj && updatedAuthObj.access_token) {
    config.headers.Authorization = `Bearer ${updatedAuthObj.access_token}`
  }
  
  return config
}, (error) => {
  return Promise.reject(error)
})

// 设置响应拦截器
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    
    // 如果是401错误且不是刷新Token的请求
    if (error.response && error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/api/auth/refresh')) {
      originalRequest._retry = true
      
      const authObj = takeAccessToken()
      if (!authObj || !authObj.refresh_token) {
        deleteAccessToken()
        window.location.href = '/login'
        return Promise.reject(error)
      }
      
      // 尝试刷新Token
      const result = await refreshToken(authObj.refresh_token)
      if (result.success) {
        // 重新发送原始请求
        originalRequest.headers.Authorization = `Bearer ${result.access_token}`
        return axios(originalRequest)
      } else {
        // 刷新失败，清除认证信息并跳转登录页
        deleteAccessToken()
        ElMessage.warning("登录状态已过期，请重新登录！")
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

function internalPost(url, data, headers, success, failure, error = defaultError){
  axios.post(url, data, { headers: headers }).then(({data}) => {
    if(data.code === 200) {
      success(data.data)
    } else if(data.code === 403) {
      failure('登录状态已过期，请重新登录！')
      deleteAccessToken(true)
    } else {
      failure(data.message, data.code, url)
    }
  }).catch(err => error(err))
}

function internalGet(url, headers, success, failure, error = defaultError){
  axios.get(url, { headers: headers }).then(({data}) => {
    if(data.code === 200) {
      success(data.data)
    } else if(data.code === 401) {
      failure('登录状态已过期，请重新登录！')
      deleteAccessToken(true)
    } else {
      failure(data.message, data.code, url)
    }
  }).catch(err => error(err))
}

function login(username, password, remember, success, failure = defaultFailure){
  internalPost('/api/auth/login', {
    username: username,
    password: password
  }, {
    'Content-Type': 'application/x-www-form-urlencoded'
  }, (data) => {
    storeAccessToken(remember, data.access_token, data.access_expire, data.refresh_token, data.role)
    ElMessage.success(`登录成功，欢迎 ${username} 来到我们的系统`)
    success(data)
  }, failure)
}

function post(url, data, success, failure = defaultFailure) {
  internalPost(url, data, accessHeader() , success, failure)
}

function logout(success, failure = defaultFailure){
  get('/api/auth/logout', () => {
    deleteAccessToken()
    ElMessage.success(`退出登录成功，欢迎您再次使用`)
    success()
  }, failure)
}

function get(url, success, failure = defaultFailure) {
  internalGet(url, accessHeader(), success, failure)
}

function isUnauthorized() {
  const authObj = takeAccessToken()
  if (!authObj) return true
  return new Date(authObj.access_expire) <= new Date()
}

function isRoleAdmin() {
  return takeAccessToken()?.role === 'admin'
}

export { post, get, login, logout, isUnauthorized, isRoleAdmin, accessHeader }