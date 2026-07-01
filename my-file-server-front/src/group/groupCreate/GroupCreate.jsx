import React, { useState, useEffect } from 'react';
import { groupCreateGroup } from '../apiGroupFunction';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { loginUrl } from '../../common/url';
import api from '../../common/api';
import { useSelector } from 'react-redux';
import s from './GroupCreate.module.css';

const GroupCreate = () => {
    const nav = useNavigate();
    const isMobile = useOutletContext();
    const { data: userData } = useSelector((state) => state.user);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            nav(loginUrl);
        }
    }, [nav]);

    const [invitedUser, setInvitedUser] = useState([]); // 초대된 멤버 목록
    const [findedUsers, setFindedUsers] = useState([]); // 검색된 사용자 목록
    const [message, setMessage] = useState('그룹 만들기');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 검색 State
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [inputs, setInputs] = useState({
        groupName: '',
        description: '',
    });

    const handleOnChange = (e) => {
        setInputs({
            ...inputs,
            [e.target.name]: e.target.value
        });
    };

    // 실시간 유저 검색 (GroupManagement와 완벽히 동일한 메커니즘)
    const handleSearchUser = async (keyword) => {
        setSearchKeyword(keyword);
        if (!keyword.trim()) {
            setFindedUsers([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await api.get(`/main/users?id=${keyword}`);
            // 본인 및 이미 가입된 멤버 제외 필터링
            const filtered = res.data.filter(
                (user) => 
                    user.userCode !== userData?.userCode &&
                    !invitedUser.some((m) => m.userCode === user.userCode)
            );
            setFindedUsers(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const inviteUser = (user) => {
        setInvitedUser(p => [...p, user]);
        // 초대 후 검색 목록 및 인풋 초기화
        setSearchKeyword('');
        setFindedUsers([]);
    };

    const cancleInviteUser = (canceledUser) => {
        setInvitedUser(users => users.filter(user => user.userCode !== canceledUser.userCode));
    };

    const createGroup = () => {
        if (inputs.groupName.trim() === '') {
            setMessage('⚠️ 그룹 이름을 입력해주세요!');
            return;
        }
        if (invitedUser.length <= 0) {
            setMessage('⚠️ 먼저 사람을 추가해주세요!');
            return;
        }

        setIsSubmitting(true);
        const groupDescription = inputs.description.trim() === '' ? '설명이 없습니다.' : inputs.description;
        
        groupCreateGroup(invitedUser, inputs.groupName, groupDescription, () => {
            setIsSubmitting(false);
            nav('/group/select');
        });
    };

    return (
        <div className={s.mainContainer}>
            <div className={s.container}>
                
                {/* 헤더 및 뒤로가기 */}
                <div className={s.header}>
                    <button onClick={() => nav('/group/select')} className={s.backButton}>
                        <span className={s.buttonIcon}>⬅️</span> 목록으로
                    </button>
                    <div className={s.titleSection}>
                        <h1 className={s.pageTitle}>
                            <span className={s.titleIcon}>✨</span> 새 그룹 만들기
                        </h1>
                        <p className={s.subtitle}>
                            팀의 이름을 정하고 동료들을 초대하여 공동 프로젝트 공간을 시작하세요.
                        </p>
                    </div>
                </div>

                <div className={s.gridContainer}>
                    
                    {/* 왼쪽: 그룹 정보 입력 카드 */}
                    <div className={s.card}>
                        <h2 className={s.cardTitle}>📝 그룹 기본 정보</h2>
                        <div className={s.form}>
                            <div className={s.inputGroup}>
                                <label className={s.label}>그룹 이름</label>
                                <input 
                                    name='groupName' 
                                    value={inputs.groupName} 
                                    onChange={handleOnChange} 
                                    placeholder='예: 디자인 1팀, 졸업 프로젝트' 
                                    className={s.input}
                                    maxLength={20}
                                />
                            </div>
                            <div className={s.inputGroup}>
                                <label className={s.label}>그룹 설명</label>
                                <textarea 
                                    name='description' 
                                    value={inputs.description} 
                                    onChange={handleOnChange} 
                                    placeholder='그룹에 대해 소개하는 짧은 글을 적어주세요.' 
                                    className={s.textarea}
                                    maxLength={100}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽: 멤버 검색 및 초대 카드 */}
                    <div className={s.card}>
                        <h2 className={s.cardTitle}>🔍 멤버 초대하기</h2>
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
                            
                            {findedUsers.length > 0 && (
                                <ul className={s.searchResultsList}>
                                    {findedUsers.map((user) => (
                                        <li 
                                            key={user.userCode} 
                                            onClick={() => inviteUser(user)}
                                            className={s.searchResultItem}
                                        >
                                            <span className={s.searchResultId}>👤 {user.id}</span>
                                            <span className={s.inviteTag}>추가</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {searchKeyword.trim() !== '' && findedUsers.length === 0 && !isSearching && (
                                <p className={s.noResults}>검색 결과가 없습니다.</p>
                            )}
                        </div>

                        {/* 추가된 멤버 목록 */}
                        <div className={s.invitedSection}>
                            <h3 className={s.boxTitle}>추가할 멤버 목록 ({invitedUser.length})</h3>
                            <div className={s.userList}>
                                {invitedUser.length <= 0 ? (
                                    <div className={s.emptyMsg}>추가된 멤버가 없습니다.</div>
                                ) : (
                                    invitedUser.map(user => (
                                        <div className={s.userItem} key={user.userCode}>
                                            <span className={s.userId}>👥 {user.id}</span>
                                            <button onClick={() => cancleInviteUser(user)} className={s.removeBtn}>제외</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 하단 최종 그룹 생성 버튼 */}
                    <div className={s.footerSection}>
                        <button 
                            className={`${s.createSubmitBtn} ${isSubmitting ? s.disabledBtn : ''}`} 
                            onClick={createGroup}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className={s.miniSpinner}></div>
                                    그룹 생성 중...
                                </>
                            ) : (
                                message
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GroupCreate;