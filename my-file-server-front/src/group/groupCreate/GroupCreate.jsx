import React, { useState } from 'react';
import { groupCreateGroup, groupFindUser } from '../apiGroupFunction';
import { useNavigate, useOutletContext } from 'react-router-dom';
import s from './GroupCreate.module.css';
import MobileHeader from '../../main/Mobile/Component/MobileHeader';

const GroupCreate = () => {
    const [invitedUser, setInvitedUser] = useState([]); //초대 목록
    const [findedUsers, setFindedUsers] = useState([]); //찾은 유저
    const [message, setMessage] = useState('그룹 만들기');
    const nav = useNavigate();
    const isMobile = useOutletContext();
    const [inputs, setInputs] = useState({              //입력 값 핸들
        searchParam: '',
        groupName: '',
        description: '',
    });
    const handleOnChange = (e) => {
        setInputs({
            ...inputs,
            [e.target.name]: e.target.value
        });
    };
    const findUser = () => {
        groupFindUser(inputs.searchParam, (r) => {
            setFindedUsers(r);
        });
    }
    const inviteUser = (user) => { setInvitedUser(p => [...p, user]); setFindedUsers(p => p.filter(pr => (pr.userCode === user.userCode ? undefined : pr))) }
    const cancleInviteUser = (canceledUser) => {
        setInvitedUser(users => users.filter(user => user.userCode !== canceledUser.userCode ? user : null));
        setFindedUsers(users => [...users, canceledUser]);
    }
    const createGroup = () => {
        if (inputs.groupName.trim() === '') {
            setMessage('그룹 이름을 입력해주세요!');
            return;
        }
        if (inputs.description.trim() === '') {
            setInputs(p => ({ ...p, description: '설명이 없습니다.' }));
        }
        if (invitedUser.length <= 0) {
            setMessage('먼저 사람을 추가해주세요!');
            return;
        }
        groupCreateGroup(invitedUser, inputs.groupName, inputs.description, () => { nav('/group/select') });
    }
    return (
        <>
            {isMobile && <MobileHeader title={'그룹 만들기 (모바일은 완전하지 않을 수 있습니다.)'} />}
            <div className={s.container}>
                {!isMobile&&<h1>그룹 만들기</h1>}
                <div className={s.groupInformationContainer}>
                    <input name='groupName' value={inputs.groupName} onChange={handleOnChange} placeholder='그룹 이름은 무엇인가요?' />
                    <input name='description' value={inputs.description} onChange={handleOnChange} placeholder='그룹에 대한 설명을 입력해주세요.' />
                </div>
                <div>
                    <div className={s.searchContainer}>
                        <input name='searchParam' value={inputs.searchParam} onChange={handleOnChange} placeholder='그룹에 추가할 유저의 아이디를 입력해주세요.' />
                        <button onClick={findUser}>찾기</button>
                    </div>
                    <div className={s.usersContainer}>
                        <div className={s.findedUsersContainer}>
                            <h3>검색된 유저</h3>
                            {findedUsers.length <= 0 && <div>검색된 유저가 없어요</div>}
                            {findedUsers.map(user => (
                                <div className={s.findedUsers} key={user.userCode}>
                                    <div>{user.id}</div>
                                    <button onClick={() => inviteUser(user)}>추가하기</button>
                                </div>
                            ))}
                        </div>
                        <div className={s.invitedUsersContainer}>
                            <h3>추가한 유저</h3>
                            {invitedUser.length <= 0 && <div>유저를 추가해주세요.</div>}
                            {invitedUser.map(user => (
                                <div className={s.inviteUsers} key={user.userCode}>
                                    <div>{user.id}</div>
                                    <button onClick={() => cancleInviteUser(user)}>빼기</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <button className={s.create} onClick={createGroup}>{message}</button>
            </div>
        </>
    );



};

export default GroupCreate;