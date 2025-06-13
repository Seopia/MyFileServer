import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { adminGetUsers, searchUsers } from '../apiFunction';
import Pagination from 'react-js-pagination';
import UserDataComponent from './Component/UserDataComponent';
import s from './UserManagement.module.css';

const UserManagement = () => {
    const isMobile = useOutletContext();
    const { data } = useSelector((state) => state.user);
    const nav = useNavigate();

    const [users, setUsers] = useState([]);
    const [pageStatus, setPageStatus] = useState({ page: 0, totalElements: 0, });
    const [searchParam, setSearchParam] = useState('');
    const [isSearch, setIsSearch] = useState(false);

    const search = () => {
        if (searchParam.trim() === '') { return; }
        searchUsers(searchParam, (res) => {
            res && setUsers(res);
            setIsSearch(true);
            setSearchParam('');
        })
    }
    const getAllUsers = useCallback(async () => {
        await adminGetUsers(pageStatus.page, (res) => {
            setPageStatus((prevStatus) => ({
                ...prevStatus,
                totalElements: res.totalElements,
            }));
            setUsers(res.content);
        });
        setIsSearch(false);
    }, [pageStatus.page]);
    const handleKeyDown = (e) => {
        if (e.code === "Enter") {
            search()
        }
    }
    useEffect(() => { getAllUsers(); }, [pageStatus.page, getAllUsers]);
    useEffect(() => { if (data && typeof data === 'object') { data.userRole !== "ROLE_ADMIN" && nav('/'); } }, [data, nav]);

    return (
        <div className={s.container}>
            {/* Header */}
            <div className={s.header}>
                <h1 className={s.pageTitle}>
                    <span className={s.titleIcon}>👥</span>
                    유저 관리
                </h1>
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
                        <button onClick={getAllUsers} className={s.resetButton}>
                            <span className={s.buttonIcon}>🔄</span>
                            전체보기
                        </button>
                    )}
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
                                    {isMobile ? "코드" : "유저 코드"}
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
                                    <span className={s.headerIcon}>🔐</span>
                                    비밀번호
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
                <div style={{justifySelf:'center'}} className={s.paginationSection}>
                    <div className={s.paginationContainer}>
                        <Pagination
                            activePage={pageStatus.page}
                            itemsCountPerPage={9}
                            totalItemsCount={pageStatus.totalElements}
                            onChange={(page) => setPageStatus({ ...pageStatus, page: page - 1 })}
                            innerClass={s.paginationList}        // <ul class="">
                            itemClass={s.pageItem}               // <li class="">
                            linkClass={s.pageLink}               // <a class="">
                            activeClass={s.active}               // <li class="active">
                            activeLinkClass={s.activeLink}       // <a class="activeLink">
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