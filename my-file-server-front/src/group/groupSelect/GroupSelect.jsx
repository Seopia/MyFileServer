import React, { useEffect, useState } from 'react';
import { groupGetMyGroup } from '../apiGroupFunction';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { loginUrl } from '../../common/url';
import s from './GroupSelect.module.css';

const GroupSelect = () => {
    const nav = useNavigate();
    const isMobile = useOutletContext();
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            nav(loginUrl);
            return;
        }
        setIsLoading(true);
        groupGetMyGroup((r) => {
            setGroups(r);
            setIsLoading(false);
        });
    }, [nav]);

    const formatDate = (dateArr) => {
        if (!dateArr) return '';
        if (Array.isArray(dateArr)) {
            const year = dateArr[0];
            const month = String(dateArr[1]).padStart(2, '0');
            const day = String(dateArr[2]).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return dateArr.toString();
    };

    return (
        <div className={s.mainContainer}>
            <div className={s.container}>
                
                {/* 헤더 섹션 */}
                <div className={s.header}>
                    <div className={s.titleSection}>
                        <h1 className={s.pageTitle}>
                            <span className={s.titleIcon}>👥</span>
                            그룹 클라우드
                        </h1>
                        <p className={s.subtitle}>
                            팀원들과 함께 공유 폴더를 생성하고 공동으로 파일을 관리하세요.
                        </p>
                    </div>
                    <div className={s.actionButtons}>
                        <button onClick={() => nav('/group/create')} className={s.createButton}>
                            <span className={s.buttonIcon}>➕</span>그룹 만들기
                        </button>
                    </div>
                </div>

                <div className={s.divider}></div>

                {/* 콘텐츠 영역 */}
                <div className={s.contentSection}>
                    {isLoading ? (
                        <div className={s.loadingState}>
                            <div className={s.spinner}></div>
                            <p>그룹 목록을 불러오는 중...</p>
                        </div>
                    ) : groups.length > 0 ? (
                        <div className={s.groupsGrid}>
                            {groups.map((group) => (
                                <div 
                                    className={s.groupCard} 
                                    onClick={() => nav(`/group/${group.groupCode}`)} 
                                    key={group.groupCode}
                                >
                                    <div className={s.cardHeader}>
                                        <span className={s.groupAvatar}>📁</span>
                                        <span className={s.groupDate}>{formatDate(group.createAt)}</span>
                                    </div>
                                    <h3 className={s.groupName}>{group.name}</h3>
                                    <p className={s.groupDesc}>
                                        {group.description || '그룹 설명이 등록되지 않았습니다.'}
                                    </p>
                                    <div className={s.cardFooter}>
                                        <span className={s.enterLink}>클라우드 입장 ➡️</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={s.emptyState}>
                            <div className={s.emptyIcon}>☁️</div>
                            <h3 className={s.emptyTitle}>소속된 그룹이 없습니다</h3>
                            <p className={s.emptyText}>
                                새로운 그룹을 생성하거나 초대받아 동료들과 파일을 안전하게 공유해 보세요.
                            </p>
                            <button onClick={() => nav('/group/create')} className={s.emptyActionButton}>
                                👥 그룹 생성하고 시작하기
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default GroupSelect;