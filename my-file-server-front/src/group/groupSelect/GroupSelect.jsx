import React, { useEffect, useState } from 'react';
import { groupGetMyGroup } from '../apiGroupFunction';
import { useNavigate, useOutletContext } from 'react-router-dom';
import s from './GroupSelect.module.css';
//사용자의 그룹을 가져오고, 만약 그룹이 없으면
//그룹을 만들어보세요를 출력한다.
//그룹이 있다면 그룹을 선택할 수 있게 하고,
//그룹 만들기 버튼이 존재한다.
//그룹 만들기 페이지가 존재하고, 그룹을 선택하면
//그룹 클라우드로 이동한다.
//그룹 클라우드에서는 상단 바에서 그룹을 선택하여 언제든 바꿀 수 있다.
//그룹 클라우드는 폴더가 있다.
//DB는 파일에 그룹 코드가 있다.
//그룹 테이블이 있고, 그룹 멤버 테이블이 있다. 폴더도 그룹 코드가 있다.
//그룹 테이블은 무슨 정보를 가져야 하나?
//코드, 이름, 만들어진 날짜, 

const GroupSelect = () => {
    const nav = useNavigate();
    const isMobile = useOutletContext();
    const [groups, setGroups] = useState([]);
    useEffect(()=>{
        groupGetMyGroup((r)=>{
            setGroups(r);
        });
    },[])
    return (
        <>
        <div className={s.mainContainer}>
            <div>
                <div>
                    {!isMobile&&<h1>그룹 클라우드</h1>}
                    <h5>팀을 만들어 파일을 공유하세요.<br /></h5>
                </div>
                <div className={s.buttonContainer}>
                    <button onClick={()=>nav('/group/create')}>그룹 만들기</button>
                </div>
                <div className={s.hr}/>
                <div className={s.content}>
                    {groups.length>0?groups?.map(group=>(
                        <div className={s.group} onClick={()=>nav(`/group/${group.groupCode}`)} key={group.groupCode}>
                            <h3 className={s.groupName}>{group.name}</h3>
                            <div className={s.groupDate}>{group.createAt[0]+'-'+group.createAt[1]+'/'+group.createAt[2]}</div>
                        </div>
                    )):<div className={s.makeGroupText}>팀을 만들어보세요.</div>}
                </div>
            </div>
        </div>
        </>
    );
};

export default GroupSelect;