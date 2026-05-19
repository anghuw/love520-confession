import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Heart, Music, VolumeX, Lock, Sparkles } from 'lucide-react'

/* ───── 粒子星空背景 ───── */
function StarField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    let w, h, particles = [], hearts = [], glows = []
    const resize = () => { w = c.width = innerWidth; h = c.height = innerHeight }
    resize()
    window.addEventListener('resize', resize)
    // stars
    for (let i = 0; i < 200; i++) particles.push({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3, dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.8 + 0.2, pulse: Math.random() * Math.PI * 2
    })
    // floating hearts
    for (let i = 0; i < 12; i++) hearts.push({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 6 + 4, dy: -(Math.random() * 0.4 + 0.1), dx: (Math.random() - 0.5) * 0.2,
      o: Math.random() * 0.3 + 0.1
    })
    // glow orbs
    for (let i = 0; i < 5; i++) glows.push({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 120 + 60, dx: (Math.random() - 0.5) * 0.2, dy: (Math.random() - 0.5) * 0.2,
      hue: Math.random() * 60 + 260
    })
    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      t += 0.01
      // glow orbs
      glows.forEach(g => {
        g.x += g.dx; g.y += g.dy
        if (g.x < -g.r) g.x = w + g.r; if (g.x > w + g.r) g.x = -g.r
        if (g.y < -g.r) g.y = h + g.r; if (g.y > h + g.r) g.y = -g.r
        const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r)
        grad.addColorStop(0, `hsla(${g.hue},80%,60%,0.08)`)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad; ctx.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2)
      })
      // stars
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy; p.pulse += 0.02
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
        const alpha = p.o * (0.5 + 0.5 * Math.sin(p.pulse))
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.fill()
      })
      // hearts
      hearts.forEach(hh => {
        hh.x += hh.dx; hh.y += hh.dy
        if (hh.y < -30) { hh.y = h + 30; hh.x = Math.random() * w }
        ctx.save(); ctx.translate(hh.x, hh.y); ctx.globalAlpha = hh.o
        ctx.beginPath()
        const s = hh.r
        ctx.moveTo(0, s * 0.3)
        ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.5, -s, 0, -s * 0.5)
        ctx.bezierCurveTo(s * 0.5, -s, s, -s * 0.3, 0, s * 0.3)
        ctx.fillStyle = 'rgba(255,105,180,0.6)'; ctx.fill()
        ctx.restore()
      })
      requestAnimationFrame(draw)
    }
    draw()
    return () => window.removeEventListener('resize', resize)
  }, [])
  return <canvas ref={canvasRef} className="star-canvas" />
}

/* ───── 打字机效果 ───── */
function Typewriter({ text, delay = 0, speed = 60 }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    setShown('')
    let i = 0
    const timer = setTimeout(() => {
      const iv = setInterval(() => {
        i++; setShown(text.slice(0, i))
        if (i >= text.length) clearInterval(iv)
      }, speed)
      return () => clearInterval(iv)
    }, delay)
    return () => clearTimeout(timer)
  }, [text, delay, speed])
  return <span>{shown}<span className="cursor">|</span></span>
}

/* ───── 暗号解锁页 ───── */
function LockScreen({ onUnlock }) {
  const [val, setVal] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const handleSubmit = () => {
    if (val === '520') { onUnlock(); return }
    setShake(true); setError(true)
    setTimeout(() => setShake(false), 500)
  }
  return (
    <motion.div className="lock-screen"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6 }}>
      <StarField />
      <motion.div className={`glass-card lock-card ${shake ? 'shake' : ''}`}
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}>
        <div className="lock-icon"><Lock size={36} /></div>
        <h2>输入 520<br /><small>打开一封只写给你的信</small></h2>
        <div className="input-group">
          <input type="text" placeholder="请输入暗号：520" value={val}
            onChange={e => { setVal(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            maxLength={10} autoFocus />
          {error && <motion.p className="error-text"
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
            暗号不对哦，再想想 🤔
          </motion.p>}
        </div>
        <motion.button className="btn-primary" onClick={handleSubmit}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Sparkles size={18} /> 解锁
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

/* ───── 星光按钮 ───── */
function GlowButton({ children, onClick, big }) {
  return (
    <motion.button className={`btn-glow ${big ? 'btn-big' : ''}`} onClick={onClick}
      whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,105,180,0.5)' }}
      whileTap={{ scale: 0.95 }}>
      {children}
    </motion.button>
  )
}

/* ───── 剧情卡片 ───── */
const storyCards = [
  { emoji: '🌈', title: '遇见你', text: '世界开始有了特别的颜色。', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { emoji: '✨', title: '靠近你', text: '每一次聊天都像星星落进心里。', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { emoji: '💫', title: '心动你', text: '我想把认真和偏爱都给你。', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { emoji: '🚀', title: '奔向未来', text: '如果可以，我想把以后的很多天都和你一起过。', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
]

function StoryCards() {
  return (
    <div className="story-section">
      {storyCards.map((card, i) => (
        <motion.div key={i} className="story-card"
          initial={{ opacity: 0, y: 60, rotateX: 15 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: i * 0.15, duration: 0.7, type: 'spring' }}
          whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div className="card-glow" style={{ background: card.color }} />
          <div className="card-content">
            <span className="card-emoji">{card.emoji}</span>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ───── 纪念日 ───── */
function Anniversary() {
  return (
    <motion.div className="anniversary-section"
      initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }} transition={{ duration: 0.8 }}>
      <div className="anniversary-card glass-card">
        <div className="anniversary-ornament">✦</div>
        <p className="anniversary-date">2026 年 5 月 20 日</p>
        <div className="anniversary-divider" />
        <p className="anniversary-text">这一天，我想认真问你一个问题。</p>
        <div className="anniversary-ornament">✦</div>
      </div>
    </motion.div>
  )
}

/* ───── 最终告白 ───── */
function Confession({ onAccept }) {
  const [accepted, setAccepted] = useState(false)
  const fireConfetti = useCallback(() => {
    const defaults = { spread: 360, ticks: 100, gravity: 0.5, decay: 0.94, startVelocity: 30, colors: ['#ff69b4', '#ff1493', '#ffb6c1', '#fff', '#ffd700', '#ff6eb4'] }
    confetti({ ...defaults, particleCount: 80, scalar: 1.2, shapes: ['heart'] })
    confetti({ ...defaults, particleCount: 40, scalar: 0.75, shapes: ['circle'] })
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 60, origin: { x: 0.2 }, shapes: ['heart'] })
      confetti({ ...defaults, particleCount: 60, origin: { x: 0.8 }, shapes: ['heart'] })
    }, 250)
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 100, scalar: 1.5, shapes: ['heart'] })
    }, 500)
  }, [])
  const handleAccept = () => {
    setAccepted(true); fireConfetti()
    setTimeout(fireConfetti, 800)
    setTimeout(fireConfetti, 1600)
    if (onAccept) onAccept()
  }
  return (
    <motion.div className="confession-section"
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
      viewport={{ once: true }} transition={{ duration: 1 }}>
      <div className="confession-heart">
        <Heart size={80} className="beating-heart" />
      </div>
      <h2 className="confession-title">520，做我对象好不好？</h2>
      {!accepted ? (
        <GlowButton onClick={handleAccept} big>我愿意 💝</GlowButton>
      ) : (
        <motion.div className="accepted-msg glass-card"
          initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
          <Heart size={40} className="accepted-heart" />
          <p>那就说好了，</p>
          <p>从今天开始，我偏爱你。</p>
        </motion.div>
      )}
    </motion.div>
  )
}

/* ───── 音乐按钮 ───── */
function MusicBtn() {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)
  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://sf6-cdn-tos.douyinstatic.com/obj/ies-music/7180316711491619596.mp3')
      audioRef.current.loop = true
    }
    if (playing) { audioRef.current.pause() } else { audioRef.current.play().catch(() => {}) }
    setPlaying(!playing)
  }
  return (
    <motion.button className={`music-btn ${playing ? 'playing' : ''}`} onClick={toggle}
      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
      animate={playing ? { rotate: 360 } : {}}
      transition={playing ? { repeat: Infinity, duration: 4, ease: 'linear' } : {}}>
      {playing ? <Music size={22} /> : <VolumeX size={22} />}
    </motion.button>
  )
}

/* ───── 主页面 ───── */
function MainContent() {
  const [showScroll, setShowScroll] = useState(false)
  const scrollRef = useRef(null)
  const handleShowScroll = () => {
    setShowScroll(true)
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }
  return (
    <motion.div className="main-page"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <StarField />
      {/* Hero */}
      <section className="hero-section">
        <motion.div className="hero-heart"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}>
          <Heart size={100} className="hero-heart-icon" />
        </motion.div>
        <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}>
          我把今天藏进星河里，<br />只等你来打开。
        </motion.h1>
        <motion.p className="hero-subtitle" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}>
          从遇见你的那一刻起，普通日子也开始发光。
        </motion.p>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}>
          <GlowButton onClick={handleShowScroll}>继续看这封信 ✉</GlowButton>
        </motion.div>
      </section>

      {/* Scroll content */}
      {showScroll && (
        <motion.div ref={scrollRef} className="scroll-content"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}>
          <StoryCards />
          <Anniversary />
          <Confession />
        </motion.div>
      )}
      <MusicBtn />
    </motion.div>
  )
}

/* ───── App ───── */
export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {!unlocked
          ? <LockScreen key="lock" onUnlock={() => setUnlocked(true)} />
          : <MainContent key="main" />}
      </AnimatePresence>
    </div>
  )
}
