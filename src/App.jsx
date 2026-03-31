import { useState } from 'react'
import MenuScreen from './components/MenuScreen.jsx'
import GameCanvas from './components/GameCanvas.jsx'

export default function App() {
  const [gameState, setGameState] = useState('menu')
  const [chosenSkin, setChosenSkin] = useState(0)

  return (
    <div style={{ width:900, height:500, position:'relative', overflow:'hidden', margin:'0 auto' }}>
      {gameState === 'menu' && (
        <MenuScreen
          chosenSkin={chosenSkin}
          setChosenSkin={setChosenSkin}
          onStart={() => setGameState('playing')}
        />
      )}
      {gameState === 'playing' && (
        <GameCanvas
          chosenSkin={chosenSkin}
          onBackToMenu={() => setGameState('menu')}
        />
      )}
    </div>
  )
}