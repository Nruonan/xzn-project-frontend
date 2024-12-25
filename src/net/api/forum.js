import {get, post} from "@/net";
import {ElMessage} from "element-plus";
import {useStore} from "@/store/index.js";
export const apiForumTypes = () => {
  const store = useStore()
  get('/api/forum/types', data => {
    store.forum.types = data
  })
}
export const apiFollowList = () => {
  const store = useStore()
  get(`/follow/list`,(data) =>{
    store.user.follows = data
  })
}

export const apiCount = (count) =>{
  get('/api/data/count',data=>{
    count.uv = data.uv
    count.dau = data.dau
  })
}

export const apiForumTopic = (tid, success) =>
    get(`api/forum/topic?tid=${tid}`, success)

export const apiForumInteract = (tid, type, topic, message) => {
  get(`/api/forum/interact?tid=${tid}&type=${type}&state=${!topic[type]}`, () => {
    topic[type] = !topic[type]
    if(topic[type])
      ElMessage.success(`${message}成功！`)
    else
      ElMessage.success(`已取消${message}！`)
  })
}

export const apiForumUpdateTopic = (data, success) =>
    post('/api/forum/update-topic', data, success)

export const apiForumComments = (tid, page, success) =>
    get(`/api/forum/comments?tid=${tid}&page=${page}`, success)

export const apiForumCommentDelete = (id, success) =>
    get(`/api/forum/delete-comment?cid=${id}`, success)

export const apiForumCommentSubmit = (data, success) =>
    post('/api/forum/add-comment', data, success)

export const apiForumTopicCreate = (data,success) =>
    post('/api/forum/create-topic', data, success)
export const apiAccountFollow = (id) => {
  get(`follow?id=${id}`,()=> apiFollowList())
}

export const apiForumTopTopics = (success) =>
    get('/api/forum/top-topic', success)
export const apiForumHotTopics = (success) =>
    get('/api/forum/hot-topic', success)

export const apiCommonData = (success) =>
    get('/api/common', success)

export const apiForumTopicList = (page, type, success) =>
    get(`/api/forum/list-topic?page=${page}&type=${type}`, success)

export const apiForumTopicListByFollow = (page, success) =>
    get(`/api/forum/list-topic-follow?page=${page}`, success)

export const apiForumWeather = (longitude, latitude, success) =>
    get(`/api/forum/weather?longitude=${longitude}&latitude=${latitude}`, success)

export const apiForumCollect = (success) =>
    get('api/forum/collects', success)

export const apiForumCollectDelete = (tid, success) =>
    get(`api/forum/interact?tid=${tid}&type=collect&state=false`, success)

export const apiFollowDetail = (success) =>
    get('/follow/follow-list', success)

export const apiFansDetail = (success) =>
    get('/follow/fans-list', success)