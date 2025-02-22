
import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';

const CustomModal = React.memo(({message='Enter Data', isOpen, onClose, onSubmit, isInput=false, placeholder='Enter',submitMessage='확인', closeMessage='닫기', style={
    overlay:{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    content: {
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        width:'25vw',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        borderRadius:'1vw',
        background:'aliceblue',
        boxShadow: "10px 10px 20px rgba(0, 0, 0, 0.2)",
        border:'none',
    }
}, inputStyle={
    border:'none',
    width:'80%',
    padding:10,
    outline:'none',
    borderRadius:'10px',
    boxShadow: "1px 1px 5px rgba(0, 0, 0, 0.2)",
}, buttonStyle={
    whiteSpace:'nowrap',
    padding:10,
    background:'rgba(161, 197, 255, 0.699)',
    border:'none',
    borderRadius:7,
    color:'white',
    width:'40%',
    transition:'all 0.2s ease',
    cursor:'pointer',
}, percent, timeOut, loading=false}) => {
    
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    const handleChange = (e) => setInputValue(e.target.value);

    // 폼 제출
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(inputValue);
        setInputValue('');
    };
    useEffect(() => {     
        if(timeOut){   
            const timer = setTimeout(() => {            
            onClose();
            }, timeOut);
                return () => clearTimeout(timer);
        }
      }, [timeOut, onClose]);
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Input Modal"
            style={style}
        >
            <h4 style={{textAlign:'center'}}>{message}</h4>
            <form style={{display:'flex',width:'100%',flexDirection:'column',alignItems:'center'}} onSubmit={handleSubmit}>
                {isInput &&
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                }
                { !loading &&
                <div style={{marginTop: '10px', width:'100%', display:'flex',justifyContent:'space-around'}}>
                    <button style={buttonStyle} type="submit">{submitMessage}</button>
                    <button style={buttonStyle} type="button" onClick={onClose}>{closeMessage}</button>
                </div>
                }
            </form>
            {percent?<div style={{marginTop:10,background:'rgb(127, 138, 157)',width:'90%',borderRadius:5}}>
                <div style={{width:`${percent}%`,paddingLeft:10,borderRadius:5, color:'white' ,background:'rgba(161, 197, 255)', transition:'width 0.2s ease'}}>{percent}%..</div>
            </div>:<></>}
        </Modal>
    );
});

export default CustomModal;