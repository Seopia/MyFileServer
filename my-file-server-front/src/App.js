import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./account/login/Login";
import SideBar from "./common/SideBar";
import UserPage from "./user-page/UserPage";
import Join from "./account/join/Join";
import NotFound from "./common/NotFound";
import UserManagement from "./admin/UserManagement/UserManagement";
// import GroupCreate from "./group/groupCreate/GroupCreate";
// import GroupSelect from "./group/groupSelect/GroupSelect";
// import Group from "./group/group/Group";
// import { GroupManagement } from "./group/groupManagement/GroupManagement";
import PublicFileDetail from "./main/public/detail/PublicFileDetail";
import PublicUpload from "./main/public/upload/PublicUpload";
import { loginUrl, mainUrl, personalUrl } from "./common/url";
import Personal from "./personal/Personal";
import PublicMain from "./main/public/PublicMain";
import ScrollRestoration from "./common/ScrollRestoration";
import Tutorial from "./account/tutorial/Tutorial";
import FileShareDonwload from "./personal/share/FileShareDownload";


function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollRestoration />
      <Routes>
        <Route path={loginUrl} element={<Login />} />
        <Route path="/join" element={<Join />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/private/file/:fileUUID" element={<FileShareDonwload />} />

        <Route element={<SideBar />}>
          <Route path={personalUrl} element={<Personal />} />
          <Route path={mainUrl} element={<PublicMain />} />
          <Route path="/public/upload" element={<PublicUpload />} />
          <Route path="/public/file/:fileUUID" element={<PublicFileDetail />} />
          <Route path="user/:id" element={<UserPage />} />
          <Route path="admin/user" element={<UserManagement />} />
          {/* <Route path="/group/create" element={<GroupCreate/>}/>
          <Route path="/group/select" element={<GroupSelect/>}/>
          <Route path="/group/:code" element={<Group/>}/>
          <Route path="/group/management/:code" element={<GroupManagement/>}/> */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
