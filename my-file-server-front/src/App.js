import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./account/login/Login";
import Main from "./main/Main";
import SideBar from "./common/SideBar";
import ForumMain from "./forum/pages/ForumMain";
import UserPage from "./user-page/UserPage";
import ForumDetail from "./forum/pages/ForumDetail";
import Join from "./account/join/Join";
import ForumCreate from "./forum/pages/ForumCreate";
import NotFound from "./common/NotFound";
// import MobilePublicMain from "./main/Mobile/mobilePublic/MobilePublicMain";
import UserManagement from "./admin/UserManagement/UserManagement";
import GroupCreate from "./group/groupCreate/GroupCreate";
import GroupSelect from "./group/groupSelect/GroupSelect";
import Group from "./group/group/Group";
import { GroupManagement } from "./group/groupManagement/GroupManagement";
import { Testcomponent } from "./admin/TestFolder/Testcomponent";
import Tutorial from "./account/tutorial/Tuturial";
import PublicMain from "./main/public/main/PublicMain";


function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true}}>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/join" element={<Join/>}/>
        <Route path="/tutorial" element={<Tutorial/>}/>
        <Route element={<SideBar/>}>
          <Route path="main" element={<Main/>}/>
          <Route path="/public" element={<PublicMain/>}/>
          <Route path="user/:id" element={<UserPage/>}/>
          <Route path="admin/user" element={<UserManagement/>}/>
          <Route path="/forum" element={<ForumMain/>} />
          <Route path="/forum/:code" element={<ForumDetail/>} />
          <Route path="/forum/write" element={<ForumCreate />} />

          <Route path="/group/create" element={<GroupCreate/>}/>
          <Route path="/group/select" element={<GroupSelect/>}/>
          <Route path="/group/:code" element={<Group/>}/>
          <Route path="/group/management/:code" element={<GroupManagement/>}/>
          <Route path="/t" element={<Testcomponent/>}/>
        </Route>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
