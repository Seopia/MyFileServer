import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminGetUsers } from '../apiFunction';
import Pagination from 'react-js-pagination';
import UserDataComponent from './Component/UserDataComponent';
import s from './UserManagement.module.css';

const UserManagement = () => {
    const { data } = useSelector((state) => state.user);
    const nav = useNavigate();

    const [users, setUsers] = useState([]);
    const [pageStatus, setPageStatus] = useState({ page: 0, totalElements: 0, });
    const [searchParam, setSearchParam] = useState('');
    const [isSearch, setIsSearch] = useState(false);
    const [sortOption, setSortOption] = useState("lastLoginTime");

    const getAllUsers = async () => {
        //정렬 옵션 lastLoginTime, enable, userRole
        // last는 false, enable true, userRole true
        await adminGetUsers(searchParam, pageStatus.page, sortOption, sortOption === 'lastLoginTime' ? false : true, (res) => {
            setPageStatus((prevStatus) => ({
                ...prevStatus,
                totalElements: res.totalElements,
            }));
            setUsers(res.content);
        });
    };
    const handleKeyDown = (e) => {
        if (e.code === "Enter") {
            search()
        }
    }
    const reset = async () => {
        setSearchParam('');
        setPageStatus(p => ({ ...p, page: 0 }));
        await adminGetUsers('', 0, sortOption, sortOption === 'lastLoginTime' ? false : true, (res) => {
            setPageStatus((prevStatus) => ({
                ...prevStatus,
                totalElements: res.totalElements,
            }));
            setUsers(res.content);
            setIsSearch(false);
        });
    }
    const search = () => {
        setIsSearch(true);
        getAllUsers();
    }
    useEffect(() => {
        if (pageStatus.page !== 0) {
            setPageStatus(p => ({ ...p, page: 0 }));
        } else {
            getAllUsers();
        }
    }, [sortOption]);

    useEffect(() => {
        getAllUsers();
    }, [pageStatus.page]);


    useEffect(() => { if (data && typeof data === 'object') { data.userRole !== "ROLE_ADMIN" && nav('/'); } }, [data, nav]);

    return (
        <div className={s.container}>
            {/* Header */}
            <div className={s.header}>
                <div className={s.optionContainer}>
                <h1 className={s.pageTitle}>
                    <span className={s.titleIcon}>👥</span>
                    유저 관리
                </h1>
                <div onClick={()=>nav('/admin/user/activate')} className={s.pageSubTitle}>
                    <span className={s.subTitleIcon}>📊</span>
                    유저 통계
                </div>
                </div>
                <div className={s.headerStats}>
                    <div className={s.statItem}>
                        <span className={s.statIcon}>📊</span>
                        <span className={s.statLabel}>총 사용자</span>
                        <span className={s.statValue}>{pageStatus.totalElements || users.length}</span>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className={s.searchSection}>
                <div className={s.searchContainer}>
                    <div className={s.searchInputContainer}>
                        <span className={s.searchIcon}>🔍</span>
                        <input
                            className={s.searchInput}
                            value={searchParam}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setSearchParam(e.target.value)}
                            placeholder="아이디로 검색하세요..."
                        />
                    </div>
                    <button onClick={search} className={s.searchButton}>
                        <span className={s.buttonIcon}>🔍</span>
                        검색
                    </button>
                    {isSearch && (
                        <button onClick={reset} className={s.resetButton}>
                            <span className={s.buttonIcon}>🔄</span>
                            전체보기
                        </button>
                    )}
                    <select value={sortOption} onChange={e => setSortOption(e.target.value)}>
                        <option value="lastLoginTime">마지막 로그인 시간</option>
                        <option value="enable">비활성화 유저</option>
                        <option value="userRole">관리자</option>
                    </select>
                </div>
            </div>

            {/* Table Section */}
            <div className={s.tableSection}>
                <div className={s.tableContainer}>
                    <table className={s.userTable}>
                        <thead className={s.tableHeader}>
                            <tr>
                                <th className={s.headerCell}>
                                    <span className={s.headerIcon}>🔢</span>
                                    마지막 로그인
                                </th>
                                <th className={s.headerCell}>
                                    <span className={s.headerIcon}>👤</span>
                                    아이디
                                </th>
                                <th className={s.headerCell}>
                                    <span className={s.headerIcon}>🔄</span>
                                    활성화 상태
                                </th>
                                <th className={s.headerCell}>
                                    <span className={s.headerIcon}>⚡</span>
                                    권한
                                </th>
                                <th className={s.headerCell}>
                                    이름
                                </th>
                            </tr>
                        </thead>
                        <tbody className={s.tableBody}>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <UserDataComponent
                                        key={user.userCode}
                                        user={user}
                                        setUsers={setUsers}
                                    />
                                ))
                            ) : (
                                <tr className={s.emptyRow}>
                                    <td colSpan="6" className={s.emptyCell}>
                                        <div className={s.emptyState}>
                                            <span className={s.emptyIcon}>😕</span>
                                            <span className={s.emptyText}>사용자가 없습니다</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!isSearch && pageStatus.totalElements > 10 && (
                <div style={{ justifySelf: 'center' }} className={s.paginationSection}>
                    <div className={s.paginationContainer}>
                        <Pagination
                            activePage={pageStatus.page + 1}
                            itemsCountPerPage={9}
                            totalItemsCount={pageStatus.totalElements}
                            onChange={(page) => setPageStatus({ ...pageStatus, page: page - 1 })}
                            innerClass={s.paginationList}
                            itemClass={s.pageItem}
                            linkClass={s.pageLink}
                            activeClass={s.active}
                            activeLinkClass={s.activeLink}
                            prevPageText="‹"
                            nextPageText="›"
                        />
                    </div>
                </div>
            )}
        </div>
    )
};

export default UserManagement;