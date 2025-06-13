import api from "../common/api"

export const adminGetUsers =  async(page, callBack)=>{    
    const res = await api.get(`/admin/user?page=${page}`);
    callBack(res.data);
}
export const searchUsers = async (searchParam, callBack) => {
    const res = await api.get(`/admin/user-find?id=${searchParam}`);
    callBack(res.data);
}
export const adminEnableUser = async (userCode, callBack) => {
    const res = await api.post(`/admin/user-enable/${userCode}`);
    callBack(res.data);
}
export const adminDisableUser = async (userCode, callBack) => {
    const res = await api.post(`/admin/user-disable/${userCode}`);
    callBack(res.data);
}
export const adminToggleUser = async (usercode, callBack) => {
    const res = await api.post(`/admin/user-status-toggle/${usercode}`);
    callBack(res.data);
}
