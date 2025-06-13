import ClipLoader from 'react-spinners/ClipLoader'
import PacmanLoader from 'react-spinners/ClipLoader'

export const Loading = ({text='로딩 중..', fontSize=13, size=13, type='spin'}) => {
  return (
    <div style={{display:'flex', alignItems:'center'}}>
        <div style={{fontSize:fontSize, paddingRight:10}}>{text}</div>
        {type==='spin'&&<ClipLoader color='#fff' size={size}/>}
        {type==='pacman'&&<PacmanLoader />}
    </div>
  )
}
