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

export const apiForumInteract = (tid, type, topic, success) => {
  get(`/api/forum/interact?tid=${tid}&type=${type}&state=${!topic[type]}`, success)
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

export const apiTopicList = (page, size,searchTitle,searchType, success) =>
    get(`/api/admin/forum/list?page=${page}&size=${size}&searchTitle=${searchTitle}&typeId=${searchType}`, success)
export const apiTopicDetail = (id, success) =>
    get(`/api/admin/forum/detail?id=${id}`, success)

export const apiTopicUpdate = (data, success) =>
    post('/api/admin/forum/update', data, success)

export const apiTopicRemove = (id, success) =>
    get(`/api/admin/forum/remove?id=${id}`, success)

export const apiAdminCommentList = (page, size,searchTitle, success) =>
    get(`/api/admin/forum/comment/list?page=${page}&size=${size}&searchTitle=${searchTitle}`, success)
export const apiAdminCommentDetail = (id, success) =>
    get(`/api/admin/forum/comment/detail?id=${id}`, success)

export const apiAdminCommentUpdate = (data, success) =>
    post('/api/admin/forum/comment/update', data, success)

export const apiAdminCommentRemove = (id, success) =>
    get(`/api/admin/forum/comment/remove?id=${id}`, success)

export const apiForumDrafts = (page, size, success) =>
    get(`/api/forum/drafts?page=${page}&size=${size}`, success)

export const apiForumDraftDelete = (id, success) =>
    get(`/api/forum/draft/delete?id=${id}`, success)

export const apiAdminTopicTypeList = (page, size, searchName, success) =>
    get(`/api/admin/topic-type/list?page=${page}&size=${size}&name=${searchName}`, success)

export const apiAdminTopicTypeCreate = (data, success) =>
    post('/api/admin/topic-type/create', data, success)

export const apiAdminTopicTypeUpdate = (data, success) =>
    post('/api/admin//topic-type/update', data, success)

export const apiAdminTopicTypeRemove = (id, success) =>
    get(`/api/admin//topic-type/delete?id=${id}`, success)

export const apiAdminTopicTypeDetail = (id, success) =>
    get(`/api/admin//topic-type/detail?id=${id}`, success)
