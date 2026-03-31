import jenny_preview from './characters/jenny_preview.png'
import annie_preview from './characters/annie_preview.png'
import nico_preview  from './characters/nico_preview.png'
import evil_building from './characters/evil_building.png'

const SKINS = [
  { name:'Jenny', img:jenny_preview, desc:'Cheerful & fast'  },
  { name:'Annie', img:annie_preview, desc:'Bold & brave'     },
  { name:'Nico',  img:nico_preview,  desc:'Cool & sneaky'    },
]

export default function MenuScreen({ chosenSkin, setChosenSkin, onStart }) {
  return (
    <div style={s.screen}>
      <div style={s.bgBuilding}>
        <img src={evil_building} alt="" style={{ height:'100%', opacity:0.15 }} />
      </div>

      <h1 style={s.title}>NOMO SCHOOL</h1>
      <p style={s.sub}>Collect assignments & lighters — burn the evil building!</p>
      <p style={s.choose}>— CHOOSE YOUR CHARACTER —</p>

      <div style={s.row}>
        {SKINS.map((skin, i) => (
          <div key={i} onClick={() => setChosenSkin(i)}
            style={{
              ...s.card,
              borderColor: chosenSkin===i ? '#ff8c00' : '#3a3028',
              background:  chosenSkin===i ? 'rgba(80,30,0,0.95)' : 'rgba(20,12,5,0.9)',
              boxShadow:   chosenSkin===i ? '0 0 28px rgba(255,120,0,0.7)' : 'none',
              transform:   chosenSkin===i ? 'translateY(-8px) scale(1.05)' : 'scale(1)',
            }}>
            <img src={skin.img} alt={skin.name} style={s.img} />
            <div style={s.name}>{skin.name}</div>
            <div style={s.desc}>{skin.desc}</div>
            {chosenSkin===i && <div style={s.badge}>✓ SELECTED</div>}
          </div>
        ))}
      </div>

      <button style={s.btn} onClick={onStart}>▶ START GAME</button>
      <p style={s.hint}>Arrow Keys / WASD to move &nbsp;|&nbsp; Space to jump</p>
    </div>
  )
}

const s = {
  screen:{
    width:'100%', height:'100%',
    background:'radial-gradient(ellipse at 50% 90%, #2a0800 0%, #0a0705 65%)',
    display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center',
    gap:10, position:'relative', overflow:'hidden',
  },
  bgBuilding:{
    position:'absolute', right:0, bottom:0, height:'100%',
    pointerEvents:'none',
  },
 title:{
  fontFamily:'"Press Start 2P", cursive', fontSize:28, color:'#ff8c00',
    textShadow:'0 0 30px #ff4500, 0 0 60px #ff2200',
    letterSpacing:6, margin:0,
  },
  sub:{ color:'#c8a070', fontSize:14, fontStyle:'italic', margin:0 },
  choose:{
    fontFamily:'Georgia,serif', fontSize:12,
    letterSpacing:4, color:'#ff8c00', margin:0,
  },
  row:{ display:'flex', gap:24 },
  card:{
    width:155, padding:'14px 10px',
    border:'2px solid', borderRadius:14,
    cursor:'pointer', transition:'all 0.25s',
    display:'flex', flexDirection:'column',
    alignItems:'center', gap:7,
  },
  img:{ width:95, height:115, objectFit:'contain' },
  name:{ fontFamily:'Georgia,serif', fontSize:15, color:'#ffd700', fontWeight:'bold' },
  desc:{ fontSize:11, color:'#c8a070', fontStyle:'italic' },
  badge:{ fontSize:10, color:'#ff8c00', letterSpacing:2 },
  btn:{
    fontFamily:'Georgia,serif', fontSize:17, padding:'11px 46px',
    background:'linear-gradient(135deg,#ff4500,#ff8c00)',
    border:'none', borderRadius:8, color:'#fff', cursor:'pointer',
    boxShadow:'0 0 24px rgba(255,100,0,0.6)', letterSpacing:2,
  },
  hint:{ fontSize:11, color:'rgba(245,222,179,0.4)', margin:0 },
}