import {get, post} from "@/net/index.js";
import {useStore} from "@/store/index.js";

export const apiTicketTypes = () => {
    const store = useStore()
    get('/api/ticket/types',data=>{
      store.ticket.types = data;
    })
}

export const apiUserRemind = (success) =>
    get('/api/user/privacy', success)
export const apiUserRemindSave = (data,success) =>
    post('/api/user/save-privacy', data, success)

export const apiLoadTicketList = (page,type,name,success) =>
    get(`/api/ticket/list?page=${page}&type=${type}&name=${name.value}`, success)
export const apiTicketDetail = (id,success) =>
    get(`/api/ticket?id=${id}`, success)

export const apiTakeTicketOrder = (data,success) =>
    post(`/api/ticket/save-order`, data, success)

export const apiOrderSave = (data, success) =>
    post(`/api/ticket/save-order`, data, success)

export const apiOrderList = (id, success) =>
    get(`/api/ticket/orders?uid=${id}`, success)

export const apiOrderRepeat = (data, success) =>
    post(`/api/ticket/order-repeat`, data, success)

export const apiOrderRemove = (data, success) =>
    post(`/api/ticket/remove-order`, data, success)

export const apiAdminTicketList = (page, size, success) =>
    get(`/api/admin/ticket/list?page=${page}&size=${size}`, success)

export const apiAdminTicketDetail = (id, success) =>
    get(`/api/admin/ticket/detail?id=${id}`, success)

export const apiAdminTicketAdd = (data, success) =>
    post(`/api/admin/ticket/add`, data, success)

export const apiAdminTicketUpdate = (data, success) =>
    post(`/api/admin/ticket/update`, data, success)

export const apiAdminTicketRemove = (id, success) =>
    get(`/api/admin/ticket/remove?id=${id}`, success)
