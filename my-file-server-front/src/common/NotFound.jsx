
function NotFound({code,message}) {

    return (
        <div style={{width:'100vw',height:'100vh',display:'flex',justifyContent:'center',alignItems:'center', flexDirection:'column'}}>
            <div>{code}</div>
            <div>{message}</div>
        </div>
    );
}

NotFound.defaultProps = {
    code: 404,
    message: '페이지를 찾을 수 없습니다.',
};

export default NotFound;

