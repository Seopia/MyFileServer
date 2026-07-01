import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { loginUrl } from '../../common/url';
import api from '../../common/api';
import s from './GroupManagement.module.css';
import CustomModal from '../../common/CustomModal';
import {
    groupGetThisGroup,
    groupUpdateInfo,
    groupAddMember,
    groupKickMember,
    groupDeleteGroup
} from '../apiGroupFunction';

export const GroupManagement = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const { data: userData } = useSelector((state) => state.user);

    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    
    // 수정용 State
    const [groupName, setGroupName] = useState('');
    const [groupDesc, setGroupDesc] = useState('');

    // 멤버 검색 State
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // 모달 State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // 데이터 로딩
    const fetchGroupData = useCallback(async () => {
        try {
            groupGetThisGroup(code, (data) => {
                setGroup(data);
                setGroupName(data.name || '');
                setGroupDesc(data.description || '');
            });
            const memberRes = await api.get(`/group/member?groupCode=${code}`);
            setMembers(memberRes.data);
        } catch (error) {
            console.error('그룹 정보를 불러오는 중 에러 발생:', error);
            if (error.response) {
                if (error.response.status === 404) {
                    alert('존재하지 않는 그룹입니다.');
                    navigate('/group/select');
                } else if (error.response.status === 403) {
                    alert('해당 그룹의 관리 권한이 없거나 멤버가 아닙니다.');
                    navigate('/group/select');
                } else {
                    alert('그룹 정보를 불러오지 못했습니다.');
                }
            } else {
                alert('그룹 정보를 불러오지 못했습니다.');
            }
        }
    }, [code, navigate]);

    useEffect(() => {
        fetchGroupData();
    }, [fetchGroupData]);

    // 권한 체크
    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate(loginUrl);
            return;
        }
        if (group && userData) {
            if (group.manager !== userData.userCode) {
                alert('그룹 관리 권한이 없습니다.');
                navigate(`/group/${code}`);
            }
        }
    }, [group, userData, code, navigate]);

    // 그룹 정보 수정
    const handleUpdateInfo = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) {
            alert('그룹 이름을 입력해주세요.');
            return;
        }
        try {
            console.log(code);
            
            await groupUpdateInfo(code, groupName, groupDesc);
            alert('그룹 정보가 성공적으로 변경되었습니다.');
            fetchGroupData();
        } catch (error) {
            alert('그룹 정보 변경에 실패했습니다.');
        }
    };

    // 유저 검색
    const handleSearchUser = async (keyword) => {
        setSearchKeyword(keyword);
        if (!keyword.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await api.get(`/main/users?id=${keyword}`);
            // 본인 및 이미 가입된 멤버 제외 필터링
            const filtered = res.data.filter(
                (user) => 
                    user.userCode !== userData?.userCode &&
                    !members.some((m) => m.userCode === user.userCode)
            );
            setSearchResults(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    // 멤버 초대
    const handleInviteMember = async (user) => {
        if (window.confirm(`${user.id} 님을 그룹에 초대하시겠습니까?`)) {
            try {
                await groupAddMember(code, user.userCode);
                alert(`${user.id} 님이 정상적으로 그룹에 추가되었습니다.`);
                setSearchKeyword('');
                setSearchResults([]);
                fetchGroupData();
            } catch (error) {
                alert(error.response?.data || '멤버 초대에 실패했습니다.');
            }
        }
    };

    // 멤버 추방
    const handleKickMember = async (member) => {
        if (window.confirm(`${member.id} 님을 정말 그룹에서 추방하시겠습니까?`)) {
            try {
                await groupKickMember(code, member.userCode);
                alert('추방이 완료되었습니다.');
                fetchGroupData();
            } catch (error) {
                alert('멤버 추방에 실패했습니다.');
            }
        }
    };

    // 그룹 삭제
    const handleDeleteGroupSubmit = async (text) => {
        if (text === '삭제한다') {
            try {
                groupDeleteGroup(code, (success) => {
                    if (success) {
                        alert('그룹이 영구히 삭제되었습니다.');
                        navigate('/group/select');
                    } else {
                        alert('그룹 삭제에 실패했습니다.');
                    }
                });
            } catch (error) {
                alert('그룹 삭제에 실패했습니다.');
            }
        } else {
            alert("텍스트를 정확하게 입력해주세요.");
        }
        setIsDeleteModalOpen(false);
    };

    if (!group) {
        return (
            <div className={s.loadingContainer}>
                <div className={s.spinner}></div>
                <p>그룹 정보를 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className={s.mainContainer}>
            <div className={s.container}>
                
                {/* 헤더 및 뒤로가기 */}
                <div className={s.header}>
                    <button onClick={() => navigate(`/group/${code}`)} className={s.backButton}>
                        <span className={s.buttonIcon}>⬅️</span> 그룹으로 돌아가기
                    </button>
                    <div className={s.titleSection}>
                        <h1 className={s.pageTitle}>
                            <span className={s.titleIcon}>⚙️</span> 그룹 관리
                        </h1>
                        <p className={s.subtitle}>
                            {group.name} 그룹의 설정을 구성하고 멤버를 관리합니다.
                        </p>
                    </div>
                </div>

                <div className={s.gridContainer}>
                    
                    {/* 1. 그룹 정보 수정 카드 */}
                    <div className={s.card}>
                        <h2 className={s.cardTitle}>🏠 그룹 정보 수정</h2>
                        <form onSubmit={handleUpdateInfo} className={s.form}>
                            <div className={s.inputGroup}>
                                <label className={s.label}>그룹 이름</label>
                                <input 
                                    type="text" 
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className={s.input}
                                    placeholder="그룹 이름을 입력하세요"
                                    maxLength={20}
                                />
                            </div>
                            <div className={s.inputGroup}>
                                <label className={s.label}>그룹 설명</label>
                                <textarea 
                                    value={groupDesc}
                                    onChange={(e) => setGroupDesc(e.target.value)}
                                    className={s.textarea}
                                    placeholder="그룹에 대한 간단한 설명을 적어보세요"
                                    maxLength={100}
                                />
                            </div>
                            <button type="submit" className={s.saveButton}>
                                💾 변경사항 저장
                            </button>
                        </form>
                    </div>

                    {/* 2. 신규 멤버 초대 카드 */}
                    <div className={s.card}>
                        <h2 className={s.cardTitle}>➕ 멤버 초대하기</h2>
                        <div className={s.searchSection}>
                            <label className={s.label}>아이디로 사용자 검색</label>
                            <input 
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => handleSearchUser(e.target.value)}
                                className={s.input}
                                placeholder="검색할 아이디를 입력하세요"
                            />
                            {isSearching && <p className={s.searchingText}>검색 중...</p>}
                            
                            {searchResults.length > 0 && (
                                <ul className={s.searchResultsList}>
                                    {searchResults.map((user) => (
                                        <li 
                                            key={user.userCode} 
                                            onClick={() => handleInviteMember(user)}
                                            className={s.searchResultItem}
                                        >
                                            <span className={s.searchResultId}>👤 {user.id}</span>
                                            <span className={s.inviteTag}>초대</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {searchKeyword.trim() !== '' && searchResults.length === 0 && !isSearching && (
                                <p className={s.noResults}>검색 결과가 없습니다.</p>
                            )}
                        </div>
                    </div>

                    {/* 3. 멤버 관리 카드 */}
                    <div className={s.cardFull}>
                        <h2 className={s.cardTitle}>👥 가입된 멤버 관리 ({members.length})</h2>
                        <div className={s.tableWrapper}>
                            <table className={s.memberTable}>
                                <thead>
                                    <tr>
                                        <th>아이디</th>
                                        <th>가입일</th>
                                        <th>역할</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member) => {
                                        const isManager = member.userCode === group.manager;
                                        return (
                                            <tr key={member.userCode} className={s.memberRow}>
                                                <td>
                                                    <div className={s.memberInfo}>
                                                        <div className={`${s.avatar} ${isManager ? s.managerAvatar : ''}`}>
                                                            {member.id?.[0]?.toUpperCase()}
                                                        </div>
                                                        <span className={s.memberIdText}>{member.id}</span>
                                                    </div>
                                                </td>
                                                <td>{member.joinDate || '-'}</td>
                                                <td>
                                                    <span className={`${s.roleBadge} ${isManager ? s.managerBadge : s.memberBadge}`}>
                                                        {isManager ? '👑 그룹장' : '멤버'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {!isManager ? (
                                                        <button 
                                                            onClick={() => handleKickMember(member)} 
                                                            className={s.kickButton}
                                                        >
                                                            추방
                                                        </button>
                                                    ) : (
                                                        <span className={s.actionText}>-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 4. 그룹 삭제 구역 (위험 구역) */}
                    <div className={s.dangerCard}>
                        <h2 className={s.dangerTitle}>⚠️ 위험 영역 (Danger Zone)</h2>
                        <p className={s.dangerText}>
                            그룹을 삭제하면 해당 그룹 내에 업로드된 모든 폴더 및 파일이 **영구히 삭제**되며 되돌릴 수 없습니다.
                        </p>
                        <button onClick={() => setIsDeleteModalOpen(true)} className={s.deleteGroupBtn}>
                            🗑️ 그룹 영구 삭제
                        </button>
                    </div>

                </div>
            </div>

            {/* 그룹 삭제 확인 모달 */}
            {isDeleteModalOpen && (
                <CustomModal
                    message={"이 그룹을 정말 제거하시겠습니까?\n제거하려면 아래 빈 칸에 '삭제한다'를 입력해주세요."}
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onSubmit={handleDeleteGroupSubmit}
                    submitMessage="영구 삭제"
                    closeMessage="취소"
                    placeholder="삭제한다"
                    isInput={true}
                />
            )}
        </div>
    );
};
