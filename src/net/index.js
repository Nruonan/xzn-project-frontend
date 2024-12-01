import axios from "axios";
import {ElMessage} from "element-plus";

import router from "../router/index.js";

const authItemName =  "authorize"

function accessHeader(){
  return {
    'Authorization': `Bearer ${takeAccessToken()}`,
    'RefreshToken': `Bearer ${takeRefreshToken()}`,
    'expire': getExpire()
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
function getExpire(){
  const str = localStorage.getItem(authItemName) || sessionStorage.getItem(authItemName)
  if(!str) return null;
  const authObj = JSON.parse(str)
  return authObj.access_expire
}
function  takeRefreshToken(){
  const str = localStorage.getItem(authItemName) || sessionStorage.getItem(authItemName)
  if(!str) return null;
  const authObj = JSON.parse(str)
  if(new Date(authObj.refresh_expire) <= new Date(new Date())){
    deleteAccessToken()
    ElMessage.warning({message:"登录状态已过期，请重新登录"})
    return null
  }
  return authObj.refresh_token
}
function  takeAccessToken(){
  const str = localStorage.getItem(authItemName) || sessionStorage.getItem(authItemName)
  if(!str) return null;
  const authObj = JSON.parse(str)

  if(new Date(authObj.access_expire) <= new Date(new Date())){
    // deleteAccessToken()
    // ElMessage.warning({message:"登录状态已过期，请重新登录"})
    return null
  }else{
    if (authObj.access_token === null){
      deleteAccessToken()
    }
  }
  return authObj.access_token
}
function storeAccessToken(access_token,refresh_token,access_expire,remember,refresh_expire){
  const authObj ={
    access_token: access_token,
    access_expire: access_expire,
    refresh_token: refresh_token,
    refresh_expire: refresh_expire,
  }
  const str = JSON.stringify(authObj)

  if(remember){
    localStorage.setItem(authItemName,str)
  }else{
    sessionStorage.setItem(authItemName,str)
  }
}
function deleteAccessToken(){
  localStorage.removeItem(authItemName)
  sessionStorage.removeItem(authItemName)
}


function internalPost(url, data, header, success, failure, error = defaultError ){
  axios.post(url,data, {headers:header}).then(({data}) =>{
    if (data.code === 200){
      success(data.data)
    }else{
      failure(data.message, data.code, url)
    }
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
function login(username,password,remember,success,failure = defaultFailure){
  internalPost('/api/auth/login',{
    username:username,
    password:password
  },{
    'Content-Type': 'application/x-www-form-urlencoded'
  },(data) =>{
    storeAccessToken(data.access_token,data.refresh_token,data.access_expire,remember,data.refresh_expire)
    ElMessage({message:`登录成功，欢迎 ${data.username} 来到我们的系统`,type: 'success',})
    success(data)
  },failure)
}

function  logout(success, failure = defaultFailure){
  get('/api/auth/logout',() => {
    deleteAccessToken()
    ElMessage.success(`退出登录成功，欢迎您再次使用`)
    success()
  }, failure)
}
function formatDateToTime(isoDate) {
  // 创建日期对象
  const date = new Date(isoDate);

  // 将时间调整为东八区 (UTC+8)
  const utcOffset = 8 * 60 * 60 * 1000; // 8小时的毫秒数
  const beijingDate = new Date(date.getTime());

  // 补零函数
  const pad = (number) => (number < 10 ? `0${number}` : number);

  // 获取各部分
  const year = beijingDate.getFullYear();
  const month = pad(beijingDate.getMonth() + 1); // 月份从0开始
  const day = pad(beijingDate.getDate());
  const hours = pad(beijingDate.getHours());
  const minutes = pad(beijingDate.getMinutes());
  const seconds = pad(beijingDate.getSeconds());

  // 返回格式化后的日期字符串
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.000`;
}
function isExpire(){
  const str = localStorage.getItem(authItemName) || sessionStorage.getItem(authItemName)
  if(!str) return false;
  const authObj = JSON.parse(str)
  let expire = new Date(authObj.access_expire)
  expire.setMinutes(expire.getMinutes() - 1)
  if (new Date() > expire){
    axios.get(`/api/auth/refresh?token=${authObj.refresh_token}`).then(({data}) =>{
      if (data.code === 200){
        // 数据为空说明已经过期了
        if (data.data === null){
          ElMessage.warning({message:"登录状态已过期，请重新登录"})
          deleteAccessToken()
          router.push("/")
        }
        storeAccessToken(data.data.access_token,data.data.refresh_token,formatDateToTime(data.data.access_expire),localStorage.getItem(authItemName) !== null ? true : false,formatDateToTime(data.data.refresh_expire))
      }else{
        ElMessage.warning({message:"登录状态已过期，请重新登录"})
      }
    })
  }
}
function post(url, data, success, failure = defaultFailure) {
  isExpire()
  internalPost(url, data, accessHeader() , success, failure)
}

function get(url, success, failure = defaultFailure) {
  isExpire()
  internalGet(url, accessHeader(), success, failure)
}
function  unauthorized(){
  return !takeAccessToken() && !takeRefreshToken()
}
export {login, logout,get,post, unauthorized,accessHeader}