import axios from "axios";
import {ElMessage} from "element-plus";

const authItemName = "authorize"

const accessHeader = () => {
  return {
    'Authorization': `Bearer ${takeAccessToken()}`,
  }
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
  if(new Date(authObj.access_expire) <= new Date()) {
      deleteAccessToken()
      //ElMessage.warning("登录状态已过期，请重新登录！")
      return null
  }
  return authObj.access_token
}

function isExpire(){
  let str = localStorage.getItem(authItemName) || sessionStorage.getItem(authItemName);
  if(!str) return null
  const authObj = JSON.parse(str)
  let expire = new Date(authObj.access_expire)
  if(expire <= new Date()) {
    axios.get(`/api/auth/refresh?token=${authObj.refresh_token}`,{
      headers:{
        'Authorization': `Bearer ${authObj.refresh_token}`,
      }
    }).then(({data})=>{
      if (data.data != null) {
        str = localStorage.getItem(authItemName);
        if(!str) {
          storeAccessToken(true, data.data.access_token, data.data.access_expire, data.data.refresh_token)
          //sessionStorage.removeItem(authItemName)
          return true
        }else{
          const auth = JSON.parse(str)
          if( new Date(authObj.access_expire) <= new Date()){
            storeAccessToken(true, data.data.access_token, data.data.access_expire, data.data.refresh_token)
            return true
          }else{
            return true
          }
        }

      } else {
        deleteAccessToken()
        ElMessage.warning("登录状态已过期，请重新登录！")
        return false
      }
    })
  }
  return true
}
function storeAccessToken(remember, token, expire, refresh_token){
  const authObj = {
    access_token: token,
    access_expire: expire,
    refresh_token: refresh_token
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

function internalPost(url, data, headers, success, failure, error = defaultError){
  axios.post(url, data, { headers: headers }).then(({data}) => {
    if(data.code === 200)
      success(data.data)
    else
      failure(data.message, data.code, url)
  }).catch(err => error(err))
}

function internalGet(url, headers, success, failure, error = defaultError){
  axios.get(url, { headers: headers }).then(({data}) => {
    if(data.code === 200)
      success(data.data)
    else
      failure(data.message, data.code, url)
  }).catch(err => error(err))
}

function login(username, password, remember, success, failure = defaultFailure){
  internalPost('/api/auth/login', {
    username: username,
    password: password
  }, {
    'Content-Type': 'application/x-www-form-urlencoded'
  }, (data) => {
    storeAccessToken(remember, data.access_token, data.access_expire, data.refresh_token)
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

function unauthorized() {
  return !isExpire()
}

export { post, get, login, logout, unauthorized, accessHeader }
