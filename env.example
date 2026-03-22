import { useState } from 'react'
import { useSearches } from './useSearches.js'
import { SEARCH_TYPES, BG, CREAM, MUTED, SURFACE, SERIF, PARCHMENT } from './config.js'
import SearchScreen from './SearchScreen.jsx'

export default function App() {
  const db = useSearches()
  const [activeSearchId, setActiveSearchId] = useState(null)
  const [screen, setScreen] = useState('home')
  const [newModal, setNewModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('spa_resort')

  if (db.loading) return (
    <div style={{ background: BG, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily: SERIF, color: CREAM }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
        <div style={{ color: MUTED, fontSize:14, letterSpacing:2 }}>LOADING DEAL FINDER…</div>
      </div>
    </div>
  )

  if (db.error) return (
    <div style={{ background: BG, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily: SERIF, color: CREAM, padding:20 }}>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ fontSize:40, marginBottom:16 }}>⚠️</div>
        <div style={{ color:'#f87171', fontSize:16, marginBottom:8 }}>Connection Error</div>
        <div style={{ color: MUTED, fontSize:13, marginBottom:20, lineHeight:1.6 }}>{db.error}</div>
        <div style={{ color:'rgba(200,220,190,0.4)', fontSize:12 }}>Check that your Supabase environment variables are set in Vercel.</div>
      </div>
    </div>
  )

  async function handleCreateSearch() {
    if (!newName.trim()) return
    const id = await db.createSearch({ name: newName.trim(), typeId: newType })
    setNewModal(false)
    setNewName('')
    setActiveSearchId(id)
    setScreen('search')
  }

  if (screen === 'search' && activeSearchId && db.searches[activeSearchId]) {
    return (
      <SearchScreen
        searchId={activeSearchId}
        search={db.searches[activeSearchId]}
        db={db}
        onBack={() => { setScreen('home'); setActiveSearchId(null) }}
      />
    )
  }

  // ── HOME SCREEN ──────────────────────────────────────────────────────────
  const searchList = Object.entries(db.searches)

  return (
    <div style={{ fontFamily: SERIF, background: BG, minHeight:'100vh', maxWidth:600, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ padding:'36px 22px 24px' }}>
        <div style={{ fontSize:10, letterSpacing:4, textTransform:'uppercase', color: MUTED, marginBottom:10 }}>Property Intelligence Platform</div>
        <h1 style={{ fontSize:34, fontWeight:900, color: CREAM, margin:0, lineHeight:1.05, letterSpacing:-1 }}>Deal<br/>Finder</h1>
        <div style={{ fontSize:13, color:'rgba(200,220,190,0.5)', marginTop:10 }}>AI-powered search for every deal type</div>
      </div>

      {/* Search list */}
      <div style={{ padding:'0 16px 120px' }}>
        {searchList.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(200,220,190,0.4)', fontSize:14 }}>
            No searches yet. Create your first one below.
          </div>
        ) : (
          <>
            <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'rgba(200,220,190,0.3)', marginBottom:14 }}>Your Searches</div>
            {searchList.map(([id, s]) => {
              const type = SEARCH_TYPES[s.type_id]
              if (!type) return null
              const props = (s.properties || []).filter(p => !p.is_benchmark)
              const saved = props.filter(p => p.status === 'saved').length
              const investigating = props.filter(p => p.status === 'investigate').length
              const isActive = activeSearchId === id

              return (
                <div key={id}
                  onClick={() => { setActiveSearchId(id); setScreen('search') }}
                  style={{
                    background: SURFACE,
                    borderRadius:18,
                    padding:'18px 18px 16px',
                    marginBottom:12,
                    cursor:'pointer',
                    border:`1px solid ${isActive ? type.color+'66' : 'rgba(255,255,255,0.07)'}`,
                    transition:'all 0.15s'
                  }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                        <div style={{ width:38, height:38, borderRadius:12, background:type.color+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                          {type.icon}
                        </div>
                        <div>
                          <div style={{ fontSize:17, fontWeight:700, color: CREAM, lineHeight:1.2 }}>{s.name}</div>
                          <div style={{ fontSize:11, color: MUTED, marginTop:2 }}>{type.tagline}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <span style={{ background:'rgba(74,124,89,0.2)', color:'#8aad78', borderRadius:20, padding:'3px 11px', fontSize:11 }}>✅ {saved} saved</span>
                        <span style={{ background:'rgba(212,160,23,0.2)', color:'#d4a017', borderRadius:20, padding:'3px 11px', fontSize:11 }}>🔍 {investigating} investigating</span>
                        <span style={{ background:'rgba(255,255,255,0.07)', color:'rgba(200,220,190,0.5)', borderRadius:20, padding:'3px 11px', fontSize:11 }}>{props.length} total</span>
                      </div>
                    </div>
                    <div style={{ color:'rgba(200,220,190,0.25)', fontSize:24, marginLeft:10, marginTop:4 }}>›</div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* New search button */}
        <button onClick={() => setNewModal(true)} style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1.5px dashed rgba(138,173,120,0.35)', borderRadius:18, padding:'20px', cursor:'pointer', fontFamily: SERIF, color:'rgba(200,220,190,0.6)', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:8 }}>
          <span style={{ fontSize:24, lineHeight:1 }}>＋</span>
          <span>Start a New Property Search</span>
        </button>

        {/* Footer */}
        <div style={{ textAlign:'center', marginTop:40, color:'rgba(200,220,190,0.2)', fontSize:11, letterSpacing:1 }}>
          FINER SLICE CAPITAL · DEAL FINDER v2
        </div>
      </div>

      {/* New search modal */}
      {newModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:50, display:'flex', alignItems:'flex-end', justifyContent:'center' }}
          onClick={e => { if (e.target === e.currentTarget) setNewModal(false) }}>
          <div style={{ background:'#1a2d1e', borderRadius:'22px 22px 0 0', padding:'24px 20px 44px', width:'100%', maxWidth:600 }}>
            <div style={{ width:36, height:4, background:'rgba(255,255,255,0.15)', borderRadius:2, margin:'0 auto 24px' }} />
            <div style={{ fontSize:18, fontWeight:700, color: CREAM, marginBottom:4 }}>New Property Search</div>
            <div style={{ fontSize:12, color: MUTED, marginBottom:22, lineHeight:1.5 }}>Each search has its own property pipeline, AI context, and scoring criteria.</div>

            <div style={{ fontSize:10, color:'rgba(200,220,190,0.4)', marginBottom:10, letterSpacing:2, textTransform:'uppercase' }}>Search Type</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:22 }}>
              {Object.values(SEARCH_TYPES).map(type => (
                <button key={type.id} onClick={() => setNewType(type.id)} style={{ background: newType===type.id ? 'rgba(74,124,89,0.2)' : 'rgba(255,255,255,0.04)', border:`1.5px solid ${newType===type.id ? type.color+'99' : 'rgba(255,255,255,0.08)'}`, borderRadius:14, padding:'14px 16px', cursor:'pointer', fontFamily: SERIF, textAlign:'left', display:'flex', alignItems:'center', gap:14 }}>
                  <span style={{ fontSize:24 }}>{type.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:700, color: CREAM }}>{type.label}</div>
                    <div style={{ fontSize:11, color: MUTED, marginTop:2 }}>{type.tagline}</div>
                  </div>
                  {newType===type.id && <span style={{ color: type.color, fontSize:18 }}>✓</span>}
                </button>
              ))}
              <div style={{ background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:14, opacity:0.4 }}>
                <span style={{ fontSize:24 }}>🏗️</span>
                <div>
                  <div style={{ fontSize:14, color:'rgba(200,220,190,0.6)' }}>More types coming soon</div>
                  <div style={{ fontSize:11, color:'rgba(200,220,190,0.4)', marginTop:2 }}>Commercial, multifamily, land…</div>
                </div>
              </div>
            </div>

            <div style={{ fontSize:10, color:'rgba(200,220,190,0.4)', marginBottom:8, letterSpacing:2, textTransform:'uppercase' }}>Search Name</div>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateSearch() }}
              placeholder={`e.g. "Catskills Round 2" or "Windham Airbnb"`}
              autoFocus
              style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(255,255,255,0.15)', borderRadius:12, padding:'14px 16px', fontSize:15, fontFamily: SERIF, color: CREAM, outline:'none', boxSizing:'border-box', marginBottom:18 }}
            />

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleCreateSearch} disabled={!newName.trim()} style={{ flex:1, background: newName.trim() ? '#4a7c59' : '#2a3a2e', color: newName.trim() ? CREAM : 'rgba(200,220,190,0.3)', border:'none', borderRadius:14, padding:'15px', fontSize:16, fontWeight:700, cursor: newName.trim() ? 'pointer' : 'not-allowed', fontFamily: SERIF }}>
                Create Search →
              </button>
              <button onClick={() => setNewModal(false)} style={{ background:'rgba(255,255,255,0.07)', color:'rgba(200,220,190,0.5)', border:'none', borderRadius:14, padding:'15px 20px', fontSize:16, cursor:'pointer', fontFamily: SERIF }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
