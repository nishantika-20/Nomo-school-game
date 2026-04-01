import { useEffect, useRef } from 'react'
import { LEVELS }            from '../game/levels'
import { CANVAS_W, CANVAS_H, GRAVITY, JUMP_FORCE, PLAYER_SPEED } from '../game/constants'
import { drawPlatform, drawCollectible, drawEnemy, drawHUD } from '../game/drawUtils'

import jenny_run1 from './characters/jenny_run1.png'
import jenny_run2 from './characters/jenny_run2.png'
import jenny_jump from './characters/jenny_jump.png'
import annie_run1 from './characters/annie_run1.png'
import annie_run2 from './characters/annie_run2.png'
import annie_jump from './characters/annie_jump.png'
import nico_run1  from './characters/nico_run1.png'
import nico_run2  from './characters/nico_run2.png'
import nico_jump  from './characters/nico_jump.png'
import evilBuildingSrc from './characters/evil_building.png'
import stairsSrc       from './characters/stairs.png'

const CHAR_IMGS = [
  { run1:jenny_run1, run2:jenny_run2, jump:jenny_jump },
  { run1:annie_run1, run2:annie_run2, jump:annie_jump },
  { run1:nico_run1,  run2:nico_run2,  jump:nico_jump  },
]

export default function GameCanvas({ chosenSkin, onBackToMenu }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const keys   = {}
    let animId
    let levelIndex   = 0
    let lives        = 3
    let lighters     = 0
    let assignments  = 0
    let tick         = 0
    let gameStatus   = 'loading'
    let fireProgress = 0
    let invincible   = 0
    let msgText      = ''
    let msgTimer     = 0
    let lvlData      = null
    let player       = null

    function handleKeys(e) {
      if (e.code === 'KeyR') {
        if (gameStatus === 'dead' || gameStatus === 'fail') {
          lvlData    = loadLevel(levelIndex)
          lives      = 3
          resetPlayer(player)
          gameStatus = 'playing'
        } else if (gameStatus === 'win') {
          onBackToMenu()
        }
        return
      }
      keys[e.code] = true
      e.preventDefault()
    }
    function handleKeysUp(e) { keys[e.code] = false }

    window.addEventListener('keydown', handleKeys)
    window.addEventListener('keyup',   handleKeysUp)

    const srcs  = CHAR_IMGS[chosenSkin]
    const imgs  = {}
    let loaded  = 0
    const total = 5

    function onLoad() { if (++loaded === total) init() }

    imgs.run1     = new Image(); imgs.run1.onload     = onLoad; imgs.run1.src     = srcs.run1
    imgs.run2     = new Image(); imgs.run2.onload     = onLoad; imgs.run2.src     = srcs.run2
    imgs.jump     = new Image(); imgs.jump.onload     = onLoad; imgs.jump.src     = srcs.jump
    imgs.building = new Image(); imgs.building.onload = onLoad; imgs.building.src = evilBuildingSrc
    imgs.stairs   = new Image(); imgs.stairs.onload   = onLoad; imgs.stairs.src   = stairsSrc

    function makePlayer() {
      return { x:60, y:360, w:48, h:64, vx:0, vy:0, onGround:false, facingLeft:false, frame:0, frameTimer:0 }
    }

    function resetPlayer(p) {
      p.x=60; p.y=360; p.vx=0; p.vy=0; p.onGround=false
    }

    function loadLevel(idx) {
      lighters    = 0
      assignments = 0
      const lvl   = LEVELS[idx]
      return {
        platforms:    lvl.platforms.map(p => ({...p})),
        collectibles: lvl.collectibles.map(c => ({...c, collected:false})),
        enemies:      lvl.enemies.map(e => ({...e, startX:e.x})),
      }
    }

    function showMsg(txt, dur=100) { msgText=txt; msgTimer=dur }

    function init() {
      levelIndex   = 0
      lives        = 3
      tick         = 0
      fireProgress = 0
      invincible   = 0
      msgText      = ''
      msgTimer     = 0
      lvlData      = loadLevel(0)
      player       = makePlayer()
      gameStatus   = 'playing'
    }

    function update() {
      tick++
      if (msgTimer > 0) msgTimer--

      if (gameStatus === 'burning') {
        fireProgress += 0.015
        if (fireProgress >= 1) {
          if (levelIndex < LEVELS.length - 1) {
            levelIndex++
            lvlData      = loadLevel(levelIndex)
            fireProgress = 0
            lives        = 3
            resetPlayer(player)
            gameStatus   = 'playing'
            showMsg('🔥 LEVEL ' + levelIndex + ' START!', 120)
          } else {
            gameStatus = 'win'
          }
        }
        return
      }
      if (gameStatus !== 'playing') return

      if (invincible > 0) invincible--
      const lvl = LEVELS[levelIndex]

      player.vx = 0
      if (keys['ArrowLeft']  || keys['KeyA']) { player.vx = -PLAYER_SPEED; player.facingLeft = true  }
      if (keys['ArrowRight'] || keys['KeyD']) { player.vx =  PLAYER_SPEED; player.facingLeft = false }
      if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.onGround) {
        player.vy = JUMP_FORCE; player.onGround = false
      }

      player.vy += GRAVITY
      player.x  += player.vx
      player.y  += player.vy

      player.onGround = false
      for (const p of lvlData.platforms) {
        if (
          player.x + player.w > p.x && player.x < p.x + p.w &&
          player.y + player.h > p.y && player.y + player.h < p.y + p.h + 18 &&
          player.vy >= 0
        ) {
          player.y = p.y - player.h
          player.vy = 0
          player.onGround = true
        }
      }

      if (player.x < 0) player.x = 0
      if (player.x + player.w > CANVAS_W) player.x = CANVAS_W - player.w
      if (player.y > CANVAS_H) {
        lives--
        if (lives <= 0) { gameStatus = 'dead'; return }
        resetPlayer(player)
        showMsg('💥 Fell down! Lives: ' + lives)
      }

      if (!player.onGround) player.frame = 2
      else if (player.vx !== 0) {
        if (++player.frameTimer > 10) { player.frameTimer=0; player.frame = player.frame===0?1:0 }
      } else player.frame = 0

      for (const c of lvlData.collectibles) {
        if (c.collected) continue
        if (player.x+player.w > c.x && player.x < c.x+22 &&
            player.y+player.h > c.y && player.y < c.y+26) {
          c.collected = true
          if (c.type==='lighter')    { lighters++;    showMsg('🔥 Lighter collected!',  70) }
          if (c.type==='assignment') { assignments++; showMsg('📄 Assignment collected!',70) }
        }
      }

      for (const e of lvlData.enemies) {
        e.x += e.dir * e.speed
        if (e.x > e.startX + e.range || e.x < e.startX - e.range) e.dir *= -1
        if (invincible===0 &&
            player.x+player.w-8 > e.x+4 && player.x+8 < e.x+28 &&
            player.y+player.h   > e.y+4 && player.y   < e.y+36) {
          lives--; invincible=130
          showMsg('💥 Caught! Lives: ' + lives, 90)
          if (lives<=0) gameStatus='dead'
        }
      }

      const hasEnough = lighters>=lvl.lightersNeeded && assignments>=lvl.assignmentsNeeded
      const sx = lvl.stairsX
      if (player.x+player.w > sx && player.x < sx+70 &&
          player.y+player.h > 400) {
        if (hasEnough) {
          gameStatus = 'burning'; fireProgress = 0
          showMsg('🔥 BURNING THE BUILDING!', 999)
        } else {
          showMsg(`Need ${Math.max(0,lvl.lightersNeeded-lighters)}🔥 & ${Math.max(0,lvl.assignmentsNeeded-assignments)}📄 more!`, 90)
        }
      }
    }

    function draw() {
      const lvl = LEVELS[levelIndex]

      const grad = ctx.createLinearGradient(0,0,0,CANVAS_H)
      grad.addColorStop(0, lvl.bgColor[0])
      grad.addColorStop(1, lvl.bgColor[1])
      ctx.fillStyle = grad
      ctx.fillRect(0,0,CANVAS_W,CANVAS_H)

      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      for (let i=0; i<CANVAS_W; i+=60) ctx.fillRect(i,450,30,4)

      for (const p of lvlData.platforms) drawPlatform(ctx, p, lvl.platformColor)

      const bx = lvl.buildingX
      ctx.drawImage(imgs.building, bx, 140, 100, 300)

      if (gameStatus==='burning' && fireProgress>0) {
        const fh = 300 * fireProgress
        for (let i=0; i<25; i++) {
          ctx.fillStyle = `rgba(255,${Math.floor(Math.random()*150)},0,${0.4+Math.random()*0.5})`
          ctx.fillRect(bx+Math.random()*100, 440-fh+Math.random()*fh, 6+Math.random()*18, 6+Math.random()*18)
        }
        ctx.fillStyle = `rgba(255,80,0,${fireProgress*0.35})`
        ctx.fillRect(bx-10, 140, 120, 300)
      }

      const stx = lvl.stairsX
      ctx.drawImage(imgs.stairs, stx, 370, 110, 70)

      for (const c of lvlData.collectibles) if (!c.collected) drawCollectible(ctx, c, tick)
      for (const e of lvlData.enemies) drawEnemy(ctx, e, tick)

      ctx.save()
      if (invincible>0 && Math.floor(invincible/6)%2===0) ctx.globalAlpha=0.35
      const sprite = [imgs.run1, imgs.run2, imgs.jump][player.frame]
      if (player.facingLeft) {
        ctx.translate(player.x+player.w, player.y)
        ctx.scale(-1,1)
        ctx.drawImage(sprite, 0, 0, player.w, player.h)
      } else {
        ctx.drawImage(sprite, player.x, player.y, player.w, player.h)
      }
      ctx.restore()

      drawHUD(ctx, { level:levelIndex+1, lives, lighters, assignments, lvl })

      if (msgTimer>0) {
        ctx.save()
        ctx.globalAlpha = Math.min(1, msgTimer/25)
        ctx.fillStyle   = '#ffd700'
        ctx.font        = 'bold 17px Georgia'
        ctx.textAlign   = 'center'
        ctx.shadowColor = '#ff4500'; ctx.shadowBlur = 10
        ctx.fillText(msgText, CANVAS_W/2, CANVAS_H-45)
        ctx.restore()
      }

      if (gameStatus==='dead') {
        drawOverlay(ctx,'GAME OVER','#ff4444','Press R to Retry')
        drawAngryEnemies(ctx, lvlData.enemies, tick)
      } else if (gameStatus==='win') {
        drawOverlay(ctx,'YOU WIN!','#ffd700','Press R to go back to Menu')
      } else if (gameStatus==='fail') {
        drawOverlay(ctx,'NOT ENOUGH!','#ff8c00','Press R to Retry')
        drawAngryEnemies(ctx, lvlData.enemies, tick)
      }
    }

    function drawOverlay(ctx, title, color, sub) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)'
      ctx.fillRect(0,0,CANVAS_W,CANVAS_H)
      ctx.fillStyle   = color
      ctx.font        = '28px "Press Start 2P"'
      ctx.textAlign   = 'center'
      ctx.shadowColor = color; ctx.shadowBlur = 22
      ctx.fillText(title, CANVAS_W/2, CANVAS_H/2-18)
      ctx.shadowBlur  = 0
      ctx.fillStyle   = '#f5deb3'
      ctx.font        = '11px "Press Start 2P"'
      ctx.fillText(sub, CANVAS_W/2, CANVAS_H/2+28)
    }

    function drawAngryEnemies(ctx, enemies, tick) {
      const kinds = ['teacher','security','warden']
      for (let i=0; i<Math.min(enemies.length,3); i++) {
        const ex = 280 + i*120
        const ey = 340
        ctx.fillStyle = `rgba(255,0,0,${0.2+Math.sin(tick*0.1)*0.1})`
        ctx.fillRect(ex-10, ey-10, 60, 80)
        const e = { ...enemies[i], x:ex, y:ey, kind: enemies[i]?.kind || kinds[i%3] }
        drawEnemy(ctx, e, tick)
        ctx.fillStyle = '#ff2020'
        ctx.font      = 'bold 20px Georgia'
        ctx.textAlign = 'center'
        ctx.fillText('!!', ex+14, ey-14)
      }
    }

    function loop() {
      if (gameStatus !== 'loading' && lvlData && player) {
        update()
        draw()
      } else if (gameStatus === 'loading') {
        ctx.fillStyle = '#0a0705'
        ctx.fillRect(0,0,CANVAS_W,CANVAS_H)
        ctx.fillStyle = '#ff8c00'
        ctx.font = 'bold 24px Georgia'
        ctx.textAlign = 'center'
        ctx.fillText('Loading...', CANVAS_W/2, CANVAS_H/2)
      }
      animId = requestAnimationFrame(loop)
    }

    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('keydown', handleKeys)
      window.removeEventListener('keyup',   handleKeysUp)
    }
  }, [chosenSkin])

  return <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} style={{ display:'block' }} />
}