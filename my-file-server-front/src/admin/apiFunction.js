import api from "../common/api"

export const adminGetUsers = async (keyword, page, sortField, isAsc, callBack) => {
    const query = new URLSearchParams({
        keyword: keyword ?? '',
        page: page?.toString() ?? '0',
        sortField: sortField ?? 'id',
        isAsc: isAsc?.toString() ?? 'true',
    }).toString();
    const res = await api.get(`/admin/user?${query}`);
    callBack(res.data);
}
export const adminToggleUser = async (usercode, callBack) => {
    const res = await api.patch(`/admin/users/${usercode}/activation`);
    callBack(res.data);
}
