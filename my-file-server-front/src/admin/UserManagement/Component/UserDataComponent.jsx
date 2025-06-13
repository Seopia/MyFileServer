import { useNavigate } from 'react-router-dom';
import s from './UserDataComponent.module.css';
import { adminToggleUser } from '../../apiFunction';
const UserDataComponent = ({ user, setUsers }) => {
    const nav = useNavigate();
    const goToUserPage = () => {
        nav(`/user/${user.userCode}`)
    }
    const showPassword = () => {
        alert(`비밀번호: ${user.rpw}`)
    }
    const toggleUserActivate = (userCode) => {
        adminToggleUser(userCode, res => {
            setUsers(users => users.map(user => user.userCode === userCode ? { ...user, enable: !user.enable } : user));
        })
    }

    return (
        <tr className={s.userRow}>
            <td className={s.userCode}>{user.userCode}</td>
            <td className={user.userRole === "ROLE_ADMIN" ? s.adminId : s.userId} onClick={goToUserPage}>
                <div className={s.userIdContainer}>
                    {user.userRole === "ROLE_ADMIN" && <span className={s.adminBadge}>👑</span>}
                    <span>{user.id}</span>
                </div>
            </td>
            <td className={s.statusCell}>
                <span onClick={() => toggleUserActivate(user.userCode)} className={user.enable ? s.activeStatus : s.inactiveStatus}>
                    <span className={s.statusIcon}>{user.enable ? "✅" : "❌"}</span>
                    {user.enable ? "활성화" : "비활성화"}
                </span>
            </td>
            <td className={s.roleCell}>
                <span className={user.userRole === "ROLE_ADMIN" ? s.adminRole : s.userRole}>
                    {user.userRole === "ROLE_ADMIN" ? "관리자" : "유저"}
                </span>
            </td>
            <td className={s.passwordCell} onClick={showPassword}>
                <div className={s.passwordContainer}>
                    <span className={s.passwordIcon}>🔒</span>
                </div>
            </td>
        </tr>
    )
};

export default UserDataComponent;