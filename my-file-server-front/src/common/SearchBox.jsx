
const SearchBox = ({
    value,
    setValue,
    onClick,
    boxStyle={
        display:'flex',
        gap:'10%',
    },
    inputStyle={
        outline:'none',
        paddingLeft:10,
        border:'1px solid black',
        borderRadius:5,
    },
    buttonStyle={

    }
}) => {

    return(
        <div style={boxStyle}>
            <input style={inputStyle} placeholder='제목으로 검색하세요.' value={value} onChange={(e)=>setValue(e.target.value)}/>
            <button style={buttonStyle} onClick={onClick}>이름 검색</button>
        </div>
    )
}
export default SearchBox;