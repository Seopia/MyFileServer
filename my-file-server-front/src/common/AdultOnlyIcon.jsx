import React from "react";

const AdultOnlyIcon = React.memo(({width=20,height=20})=>{
    return(
        <div style={{
            color:'brown',
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            border: '2px solid rgb(255,88,88)',
            width: width,
            height: height,
            borderRadius: width / 2,
            fontSize:width/2
        }}>19</div>
    )
});

export default AdultOnlyIcon;