import { useState, useRef, useMemo, useEffect } from 'react'
import {
  SEARCH_TYPES, scoreProperty, grade, STATUS, barColor,
  formatUrl, displayDomain, fmtTime,
  SERIF, BG, CREAM, MUTED, PARCHMENT, FOREST
} from './config.js'

export default function SearchScreen({ searchId, search, db, onBack }) {
  const [tab, setTab] = useState('list')       // list | chat
  const [detailId, setDetailId] = useState(null)
  const [addForm, setAddForm] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [addPreview, setAddPreview] = useState(null)
  const [newComment, setNewComment] = useState('')
  const chatEndRef = useRef(null)

  const typeConfig = SEARCH_TYPES[search.type_id]
  const color = typeConfig?.color || '#4a7c59'

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [search.chat, chatLoading])

  // ── Computed ─────────────────────────────────────────────────────────────
  const scored = useMemo(() =>
    (search.properties || [])
      .map(p => ({ ...p, score: scoreProperty(search.type_id, p) }))
      .filter(p => search.filter === 'all' || p.status === search.filter)
      .sort((a, b) => {
        if (a.is_benchmark) return -1
        if (b.is_benchmark) return 1
        if (search.sort_by === 'score') {
          return (typeof b.score === 'number' ? b.score : 0) - (typeof a.score === 'number' ? a.score : 0)
        }
        return (a.name || '').localeCompare(b.name || '')
      }),
    [search.properties, search.filter, search.sort_by, search.type_id]
  )

  const selected = useMemo(() => {
    const p = (search.properties || []).find(p => p.id === detailId)
    return p ? { ...p, score: scoreProperty(search.type_id, p) } : null
  }, [search.properties, detailId, search.type_id])

  const counts = useMemo(() => {
    const c = {}
    ;(search.properties || []).filter(p => !p.is_benchmark).forEach(({ status }) => {
      c[status] = (c[status] || 0) + 1
    })
    return c
  }, [search.properties])

  // ── AI Chat ──────────────────────────────────────────────────────────────
  function parseAddProp(content) {
    const m = content.match(/```add-property\s*([\s\S]*?)```/)
    if (!m) return null
    try { return JSON.parse(m[1].trim()) } catch { return null }
  }

  async function sendChat(e) {
    e?.preventDefault()
    const text = chatInput.trim()
    if (!text || chatLoading) return
    setChatInput('')
    setChatLoading(true)
    setAddPreview(null)

    // Add user message
    await db.appendChatMessage(searchId, 'user', text)
    const currentChat = [...(search.chat || []), { role: 'user', content: text }]

    try {
      const scoredProps = (search.properties || []).map(p => ({
        ...p, score: scoreProperty(search.type_id, p)
      }))
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: typeConfig.systemPrompt(scoredProps),
          messages: currentChat.map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await response.json()
      const raw = data.content?.map(b => b.text || '').join('') || 'Sorry, no response.'
      const parsed = parseAddProp(raw)
      if (parsed) setAddPreview(parsed)
      await db.appendChatMessage(searchId, 'assistant', raw)
    } catch {
      await db.appendChatMessage(searchId, 'assistant', 'Connection error. Please try again.')
    }
    setChatLoading(false)
  }

  function renderMsg(content) {
    const parts = content.split(/(```add-property[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```add-property')) return null
      return part.split('\n').map((line, j) => {
        const key = `${i}-${j}`
        if (line.startsWith('## ')) return <div key={key} style={{ fontSize:13, fontWeight:700, color:'#1a1a1a', marginTop:8, marginBottom:3 }}>{line.slice(3)}</div>
        if (line.startsWith('- ') || line.startsWith('• ')) return (
          <div key={key} style={{ fontSize:13, lineHeight:1.6, paddingLeft:10, marginBottom:2, display:'flex', gap:6 }}>
            <span style={{ color: MUTED, flexShrink:0 }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        )
        if (!line.trim()) return <div key={key} style={{ height:5 }} />
        return <div key={key} style={{ fontSize:13, lineHeight:1.6, marginBottom:2 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      })
    })
  }

  if (!typeConfig) return <div style={{ color: CREAM, padding:20 }}>Unknown search type</div>

  // ── Bottom Nav ───────────────────────────────────────────────────────────
  const BottomNav = () => (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, background: FOREST, padding:'10px 0 14px', display:'flex', justifyContent:'space-around', maxWidth:600, margin:'0 auto', zIndex:20, borderTop:'1px solid rgba(255,255,255,0.07)' }}>
      <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:2, opacity:0.4 }}>
        <span style={{ fontSize:18 }}>🏠</span>
        <span style={{ fontSize:9, color: MUTED, fontFamily: SERIF }}>HOME</span>
      </button>
      <button onClick={() => { setTab('list'); setDetailId(null); setAddForm(null) }} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:2, opacity: tab==='list' ? 1 : 0.4 }}>
        <span style={{ fontSize:18 }}>🗂</span>
        <span style={{ fontSize:9, color: MUTED, fontFamily: SERIF }}>PROPERTIES</span>
      </button>
      <button onClick={() => setTab('chat')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:2, opacity: tab==='chat' ? 1 : 0.4 }}>
        <span style={{ fontSize:18 }}>🤖</span>
        <span style={{ fontSize:9, color: MUTED, fontFamily: SERIF }}>AI FIND</span>
        {chatLoading && <span style={{ position:'absolute', top:10, width:8, height:8, background: MUTED, borderRadius:'50%', animation:'pulse 1s infinite' }} />}
      </button>
    </div>
  )

  // ── Detail View ──────────────────────────────────────────────────────────
  if (tab === 'list' && detailId !== null && selected) {
    const isBM = selected.is_benchmark
    const { g, color: gc, bg: gbg } = grade(selected.score)
    const comments = selected.comments || []

    return (
      <div style={{ fontFamily: SERIF, background: isBM ? '#fffdf0' : CREAM, minHeight:'100vh', maxWidth:600, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ background: FOREST, color: PARCHMENT, padding:'12px 14px 14px', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: isBM ? 0 : 10 }}>
            <button onClick={() => setDetailId(null)} style={{ background:'rgba(255,255,255,0.12)', border:'none', borderRadius:8, padding:'7px 13px', color: PARCHMENT, cursor:'pointer', fontSize:14, fontFamily: SERIF }}>←</button>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:9, letterSpacing:2, color: MUTED, textTransform:'uppercase', marginBottom:1 }}>
                {isBM ? `📐 ${typeConfig.label} Benchmark` : selected.location}
              </div>
              <div style={{ fontSize:15, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{selected.name}</div>
            </div>
            <div style={{ background: gbg, borderRadius:10, padding:'5px 10px', textAlign:'center', flexShrink:0 }}>
              <div style={{ fontSize:20, fontWeight:900, color:gc, lineHeight:1 }}>{selected.score}</div>
              <div style={{ fontSize:10, fontWeight:700, color:gc }}>{g}</div>
            </div>
          </div>
          {!isBM && (
            <div style={{ display:'flex', gap:5, overflowX:'auto' }}>
              {Object.entries(STATUS).map(([k, v]) => (
                <button key={k} onClick={() => db.updateProperty(searchId, selected.id, { status: k })}
                  style={{ background: selected.status===k ? MUTED : 'rgba(255,255,255,0.1)', color: selected.status===k ? FOREST : 'rgba(200,216,184,0.7)', border:'none', borderRadius:20, padding:'5px 11px', fontSize:11, fontWeight: selected.status===k ? 700 : 400, cursor:'pointer', fontFamily: SERIF, whiteSpace:'nowrap' }}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding:'14px 14px 100px' }}>
          {/* Quick facts */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
            {[
              ['🏠', 'Owner', selected.owner || 'Unknown'],
              ['📅', 'Founded', selected.founded_years || 'Unknown'],
              ['🗺️', 'Acres', selected.acres ? `${selected.acres}ac` : 'Unknown'],
              ['⛺', 'Sites', selected.sites || selected.bedrooms || 'Unknown'],
              ['🏚️', 'Cabins/Baths', selected.cabins != null ? selected.cabins : selected.bathrooms || 'Unknown'],
              ['🗓️', 'Season', selected.seasonal ? 'May–Oct' : 'Year-round']
            ].map(([e, l, v]) => (
              <div key={l} style={{ background:'#fff', borderRadius:10, padding:'10px 12px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize:10, color:'#999', marginBottom:2 }}>{e} {l}</div>
                <div style={{ fontSize:12, fontWeight:600, color: FOREST, wordBreak:'break-word', lineHeight:1.4 }}>{String(v)}</div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div style={{ background: FOREST, borderRadius:12, padding:'12px 14px', marginBottom:14 }}>
            <div style={{ fontSize:9, letterSpacing:2, color: MUTED, textTransform:'uppercase', marginBottom:10 }}>Contact / Links</div>
            {selected.phone && selected.phone !== 'Unknown' && (
              <a href={`tel:${selected.phone}`} style={{ color: PARCHMENT, textDecoration:'none', display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <span style={{ background:'rgba(138,173,120,0.2)', borderRadius:6, padding:'3px 8px', fontSize:12, flexShrink:0 }}>📞</span>
                <span style={{ fontSize:14 }}>{selected.phone}</span>
              </a>
            )}
            {selected.address && (
              <div style={{ color: MUTED, display:'flex', alignItems:'flex-start', gap:10, fontSize:12, marginBottom:8 }}>
                <span style={{ background:'rgba(138,173,120,0.2)', borderRadius:6, padding:'3px 8px', fontSize:12, flexShrink:0 }}>📍</span>
                <span style={{ lineHeight:1.4 }}>{selected.address}</span>
              </div>
            )}
            {selected.website && (
              <a href={formatUrl(selected.website)} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
                <span style={{ background:'rgba(138,173,120,0.2)', borderRadius:6, padding:'3px 8px', fontSize:12, flexShrink:0 }}>🌐</span>
                <span style={{ fontSize:14, color: MUTED, textDecoration:'underline', textUnderlineOffset:3 }}>{displayDomain(selected.website)}</span>
                <span style={{ fontSize:12, color:'rgba(138,173,120,0.4)', marginLeft:'auto' }}>↗</span>
              </a>
            )}
          </div>

          {/* Ask AI */}
          <button onClick={() => { setChatInput(`Research ${selected.name} in detail — owner intel, property assessment, and recommended next steps.`); setTab('chat') }}
            style={{ width:'100%', background:`${color}15`, border:`1.5px dashed ${color}66`, borderRadius:12, padding:'12px', marginBottom:14, cursor:'pointer', fontFamily: SERIF, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:20 }}>🤖</span>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:13, fontWeight:700, color: FOREST }}>Ask AI to research this property</div>
              <div style={{ fontSize:11, color:'#888' }}>Owner intel · outreach letter · revenue analysis</div>
            </div>
            <span style={{ marginLeft:'auto', color, fontSize:18 }}>→</span>
          </button>

          {/* Scoring */}
          {!isBM && (
            <div style={{ background:'#fff', borderRadius:12, padding:14, marginBottom:14, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize:9, letterSpacing:2, color:'#aaa', textTransform:'uppercase', marginBottom:14 }}>Scoring — drag to adjust</div>
              {typeConfig.criteria.map(({ key, label, emoji, weight, description }) => {
                const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
                const v = selected[key] ?? selected[snakeKey] ?? 0
                const bc = barColor(v)
                return (
                  <div key={key} style={{ marginBottom:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:2 }}>
                      <div>
                        <span style={{ fontSize:13, fontWeight:700, color: FOREST }}>{emoji} {label}</span>
                        <span style={{ fontSize:10, color:'#ccc', marginLeft:6 }}>wt:{weight}%</span>
                      </div>
                      <span style={{ fontSize:15, fontWeight:800, color:bc }}>{v}<span style={{ fontSize:10, color:'#ccc', fontWeight:400 }}>/10</span></span>
                    </div>
                    <div style={{ fontSize:10, color:'#aaa', marginBottom:5, lineHeight:1.3 }}>{description}</div>
                    <div style={{ position:'relative', height:28 }}>
                      <div style={{ position:'absolute', top:'50%', left:0, right:0, height:7, borderRadius:4, background:'#ede8e0', transform:'translateY(-50%)' }}>
                        <div style={{ height:'100%', borderRadius:4, width:`${v*10}%`, background:bc, transition:'width 0.2s' }} />
                      </div>
                      <input type="range" min="0" max="10" value={v}
                        onChange={e => db.updateProperty(searchId, selected.id, { [snakeKey]: Number(e.target.value) })}
                        style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Notes */}
          <div style={{ background:'#fff', borderRadius:12, padding:14, marginBottom:14, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:9, letterSpacing:2, color:'#aaa', textTransform:'uppercase', marginBottom:8 }}>Research Notes</div>
            <textarea value={selected.notes || ''} onChange={e => db.updateProperty(searchId, selected.id, { notes: e.target.value })}
              placeholder="Owner intel, red flags, follow-up actions…"
              style={{ width:'100%', border:'1.5px solid #e8e0d4', borderRadius:8, padding:'10px 12px', fontSize:13, fontFamily: SERIF, color: FOREST, background:'#faf8f5', resize:'vertical', minHeight:100, outline:'none', boxSizing:'border-box', lineHeight:1.6 }}
            />
          </div>

          {/* Comments */}
          <div style={{ background:'#fff', borderRadius:12, padding:14, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:9, letterSpacing:2, color:'#aaa', textTransform:'uppercase', marginBottom:12 }}>
              Comments
              {comments.length > 0 && <span style={{ background:'#e8f0fb', color:'#2563a8', borderRadius:10, padding:'1px 7px', fontSize:10, textTransform:'none', letterSpacing:0, marginLeft:8 }}>{comments.length}</span>}
            </div>
            {comments.length === 0
              ? <div style={{ fontSize:12, color:'#ccc', fontStyle:'italic', marginBottom:12 }}>No comments yet.</div>
              : <div style={{ marginBottom:14 }}>
                  {comments.map(cm => (
                    <div key={cm.id} style={{ borderLeft:`3px solid ${MUTED}`, paddingLeft:12, marginBottom:12, position:'relative' }}>
                      <div style={{ fontSize:10, color:'#bbb', marginBottom:3 }}>🕐 {fmtTime(cm.created_at || cm.ts)}</div>
                      <div style={{ fontSize:13, color: FOREST, lineHeight:1.6 }}>{cm.text}</div>
                      <button onClick={() => db.deleteComment(searchId, selected.id, cm.id)} style={{ position:'absolute', top:0, right:0, background:'none', border:'none', color:'#ddd', cursor:'pointer', fontSize:16 }}>×</button>
                    </div>
                  ))}
                </div>
            }
            <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
              <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); if (newComment.trim()) { db.addComment(searchId, selected.id, newComment.trim()); setNewComment('') } } }}
                placeholder="Add a comment… (Enter to save)"
                style={{ flex:1, border:'1.5px solid #e8e0d4', borderRadius:8, padding:'10px 12px', fontSize:13, fontFamily: SERIF, color: FOREST, background:'#faf8f5', resize:'none', minHeight:70, outline:'none', boxSizing:'border-box', lineHeight:1.5 }}
              />
              <button onClick={() => { if (newComment.trim()) { db.addComment(searchId, selected.id, newComment.trim()); setNewComment('') } }}
                style={{ background: newComment.trim() ? FOREST : '#e8e0d4', color: newComment.trim() ? MUTED : '#bbb', border:'none', borderRadius:8, padding:'10px 14px', fontSize:12, fontWeight:700, cursor: newComment.trim() ? 'pointer' : 'not-allowed', fontFamily: SERIF, flexShrink:0, height:70, lineHeight:1.4, textAlign:'center' }}>
                Add<br/>💬
              </button>
            </div>
          </div>
        </div>
        <BottomNav />
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>
    )
  }

  // ── Add Form ─────────────────────────────────────────────────────────────
  if (tab === 'list' && addForm) {
    return (
      <div style={{ fontFamily: SERIF, background: CREAM, minHeight:'100vh', maxWidth:600, margin:'0 auto' }}>
        <div style={{ background: FOREST, color: PARCHMENT, padding:'12px 14px', position:'sticky', top:0, zIndex:10, display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => setAddForm(null)} style={{ background:'rgba(255,255,255,0.12)', border:'none', borderRadius:8, padding:'7px 13px', color: PARCHMENT, cursor:'pointer', fontSize:14, fontFamily: SERIF }}>←</button>
          <div>
            <div style={{ fontSize:9, letterSpacing:2, color: MUTED, textTransform:'uppercase' }}>Add Property</div>
            <div style={{ fontSize:16, fontWeight:700 }}>{typeConfig.label}</div>
          </div>
        </div>
        <div style={{ padding:'14px 14px 100px' }}>
          <div style={{ background:'#fff', borderRadius:12, padding:14, marginBottom:14, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:9, letterSpacing:2, color:'#aaa', textTransform:'uppercase', marginBottom:12 }}>Property Info</div>
            {[['name','Property Name *'],['location','Location (Town, County)'],['address','Street Address'],['phone','Phone'],['website','Website URL'],['owner','Owner Name'],['founded_years','Founded / Years Owned'],['acres','Acres']].map(([key,label]) => (
              <div key={key} style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, color:'#999', display:'block', marginBottom:4 }}>{label}</label>
                <input value={addForm[key]||''} onChange={e => setAddForm(p => ({...p,[key]:e.target.value}))}
                  style={{ width:'100%', border:'1.5px solid #e8e0d4', borderRadius:8, padding:'10px 12px', fontSize:14, fontFamily: SERIF, background:'#faf8f5', outline:'none', boxSizing:'border-box' }} />
              </div>
            ))}
            <div style={{ fontSize:11, color:'#999', marginBottom:8 }}>Status</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {Object.entries(STATUS).map(([k, v]) => (
                <button key={k} onClick={() => setAddForm(p => ({...p, status:k}))}
                  style={{ background: addForm.status===k ? FOREST : '#f0ece6', color: addForm.status===k ? MUTED : '#888', border:'none', borderRadius:20, padding:'6px 14px', fontSize:12, cursor:'pointer', fontFamily: SERIF, fontWeight: addForm.status===k ? 700 : 400 }}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background:'#fff', borderRadius:12, padding:14, marginBottom:14, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:9, letterSpacing:2, color:'#aaa', textTransform:'uppercase', marginBottom:14 }}>Score Each Criterion</div>
            {typeConfig.criteria.map(({ key, label, emoji, description }) => {
              const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
              const v = addForm[snakeKey] ?? 5
              return (
                <div key={key} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                    <span style={{ fontSize:13, fontWeight:700, color: FOREST }}>{emoji} {label}</span>
                    <span style={{ fontSize:14, fontWeight:800, color:barColor(v) }}>{v}/10</span>
                  </div>
                  <div style={{ fontSize:10, color:'#aaa', marginBottom:5 }}>{description}</div>
                  <input type="range" min="0" max="10" value={v}
                    onChange={e => setAddForm(p => ({...p, [snakeKey]: Number(e.target.value)}))}
                    style={{ width:'100%' }} />
                </div>
              )
            })}
          </div>

          <div style={{ background:'#fff', borderRadius:12, padding:14, marginBottom:18, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:9, letterSpacing:2, color:'#aaa', textTransform:'uppercase', marginBottom:8 }}>Notes</div>
            <textarea value={addForm.notes||''} onChange={e => setAddForm(p => ({...p, notes:e.target.value}))}
              placeholder="Research notes, owner intel…"
              style={{ width:'100%', border:'1.5px solid #e8e0d4', borderRadius:8, padding:'10px 12px', fontSize:13, fontFamily: SERIF, background:'#faf8f5', resize:'vertical', minHeight:80, outline:'none', boxSizing:'border-box' }}
            />
          </div>

          <button onClick={async () => {
            if (!addForm.name?.trim()) return
            await db.addProperty(searchId, { ...addForm, acres: addForm.acres ? Number(addForm.acres) : null })
            setAddForm(null)
          }} disabled={!addForm.name?.trim()}
            style={{ width:'100%', background: addForm.name?.trim() ? FOREST : '#ccc', color: addForm.name?.trim() ? MUTED : '#999', border:'none', borderRadius:12, padding:16, fontSize:16, fontWeight:700, cursor: addForm.name?.trim() ? 'pointer' : 'not-allowed', fontFamily: SERIF }}>
            Save Property →
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  // ── Chat Tab ─────────────────────────────────────────────────────────────
  if (tab === 'chat') {
    const suggestions = search.type_id === 'spa_resort' ? [
      "Find new campgrounds on the Esopus Creek near Phoenicia",
      "Draft an outreach letter to Terri Janis at Russell Brook",
      "Who owns Uncle Pete's Campground now?",
      "Compare Russell Brook vs Peaceful Valley",
    ] : [
      "Find A-frames near Hunter Mountain under $700K",
      "Estimate Airbnb revenue for a cabin near Windham",
      "Which upgrades give best STR ROI for a ski cabin?",
      "Find similar properties to the Hunter A-frame",
    ]

    return (
      <div style={{ fontFamily: SERIF, background: CREAM, minHeight:'100vh', maxWidth:600, margin:'0 auto', display:'flex', flexDirection:'column' }}>
        <div style={{ background: FOREST, color: PARCHMENT, padding:'12px 14px', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ fontSize:9, letterSpacing:2, color: MUTED, textTransform:'uppercase' }}>{typeConfig.icon} {search.name}</div>
          <div style={{ fontSize:17, fontWeight:700 }}>AI Property Finder</div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', paddingBottom:180 }}>
          {(search.chat || []).map((msg, i) => {
            const isUser = msg.role === 'user'
            const parsed = parseAddProp(msg.content)
            const isLast = i === (search.chat || []).length - 1
            return (
              <div key={i} style={{ marginBottom:14, display:'flex', flexDirection:'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                {!isUser && <div style={{ fontSize:10, color: MUTED, marginBottom:4, paddingLeft:4 }}>🤖 {search.name} Assistant</div>}
                <div style={{ maxWidth:'88%', borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px', padding:'10px 14px', background: isUser ? FOREST : '#fff', color: isUser ? PARCHMENT : '#1a1a1a', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
                  {isUser
                    ? <div style={{ fontSize:13, lineHeight:1.5 }}>{msg.content}</div>
                    : <div>{renderMsg(msg.content)}</div>
                  }
                </div>
                {parsed && isLast && addPreview && (
                  <div style={{ marginTop:10, background:'#edf4ea', borderRadius:12, padding:'12px 14px', border:`1.5px solid ${color}`, maxWidth:'88%' }}>
                    <div style={{ fontSize:11, color, fontWeight:700, marginBottom:6 }}>📍 Property found — add to tracker?</div>
                    <div style={{ fontSize:13, fontWeight:700, color: FOREST, marginBottom:2 }}>{addPreview.name}</div>
                    <div style={{ fontSize:11, color:'#666', marginBottom:10 }}>{addPreview.location}</div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={async () => {
                        await db.addProperty(searchId, addPreview)
                        setAddPreview(null)
                        await db.appendChatMessage(searchId, 'assistant', `✅ **${addPreview.name}** has been added to your tracker!`)
                      }} style={{ background: color, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily: SERIF }}>
                        + Add to Tracker
                      </button>
                      <button onClick={() => setAddPreview(null)} style={{ background:'#e8e0d4', color:'#888', border:'none', borderRadius:8, padding:'8px 14px', fontSize:13, cursor:'pointer', fontFamily: SERIF }}>Dismiss</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {chatLoading && (
            <div style={{ marginBottom:14 }}>
              <div style={{ background:'#fff', borderRadius:'4px 16px 16px 16px', padding:'12px 16px', display:'inline-block', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
                <div style={{ display:'flex', gap:5 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:'50%', background: MUTED, opacity:0.7, animation:`bounce 1.2s ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested prompts */}
        {(search.chat || []).length <= 2 && (
          <div style={{ position:'fixed', bottom:140, left:0, right:0, padding:'0 14px', maxWidth:600, margin:'0 auto', zIndex:14 }}>
            <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4 }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => setChatInput(s)}
                  style={{ background:'#fff', border:'1px solid #e0d8ce', borderRadius:20, padding:'6px 12px', fontSize:11, color:'#555', cursor:'pointer', fontFamily: SERIF, whiteSpace:'nowrap', flexShrink:0, boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ position:'fixed', bottom:62, left:0, right:0, background:'#fff', borderTop:'1px solid #e8e0d4', padding:'10px 14px', maxWidth:600, margin:'0 auto', zIndex:15 }}>
          <form onSubmit={sendChat} style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
            <textarea value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }}
              placeholder={`Ask about ${typeConfig.label.toLowerCase()} properties…`}
              rows={2}
              style={{ flex:1, border:`1.5px solid ${color}44`, borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily: SERIF, color: FOREST, background:'#f4f0e8', resize:'none', outline:'none', lineHeight:1.4 }}
            />
            <button type="submit" disabled={!chatInput.trim() || chatLoading}
              style={{ background: chatInput.trim() && !chatLoading ? color : '#ddd', color:'#fff', border:'none', borderRadius:10, width:44, height:44, fontSize:18, cursor: chatInput.trim() && !chatLoading ? 'pointer' : 'not-allowed', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>↑</button>
          </form>
          <div style={{ fontSize:10, color:'#bbb', marginTop:4 }}>Enter to send · Shift+Enter for new line</div>
        </div>

        <BottomNav />
        <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>
    )
  }

  // ── Property List ─────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: SERIF, background: CREAM, minHeight:'100vh', maxWidth:600, margin:'0 auto' }}>
      <div style={{ background: FOREST, color: PARCHMENT, padding:'14px 14px 0', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={onBack} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:8, padding:'6px 10px', color: PARCHMENT, cursor:'pointer', fontSize:12, fontFamily: SERIF }}>← Home</button>
            <div>
              <div style={{ fontSize:9, letterSpacing:2, color: MUTED, textTransform:'uppercase' }}>{typeConfig.icon} {typeConfig.tagline}</div>
              <div style={{ fontSize:16, fontWeight:700 }}>{search.name}</div>
            </div>
          </div>
          <button onClick={() => {
            const defaults = {}
            typeConfig.criteria.forEach(c => {
              const snakeKey = c.key.replace(/([A-Z])/g, '_$1').toLowerCase()
              defaults[snakeKey] = 5
            })
            setAddForm({ name:'', location:'', address:'', phone:'', website:'', owner:'', founded_years:'', acres:'', notes:'', status:'investigate', seasonal: true, ...defaults })
          }} style={{ background:'rgba(255,255,255,0.15)', color: PARCHMENT, border:'1px solid rgba(255,255,255,0.2)', borderRadius:8, padding:'7px 12px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily: SERIF }}>
            + Add
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:0, overflowX:'auto', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          {[
            ['all', 'All', (search.properties||[]).filter(p=>!p.is_benchmark).length],
            ...Object.entries(STATUS).map(([k,v]) => [k, v.label, counts[k]||0])
          ].map(([key, label, count]) => (
            <button key={key} onClick={() => db.updateSearchMeta(searchId, { filter: key })}
              style={{ background:'none', border:'none', color: search.filter===key ? MUTED : 'rgba(200,216,184,0.4)', fontFamily: SERIF, fontSize:11, fontWeight: search.filter===key ? 700 : 400, padding:'9px 10px', cursor:'pointer', whiteSpace:'nowrap', borderBottom: search.filter===key ? `2px solid ${MUTED}` : '2px solid transparent' }}>
              {label} <span style={{ opacity:0.6, fontSize:10 }}>{count}</span>
            </button>
          ))}
          <div style={{ flex:1 }} />
          <button onClick={() => db.updateSearchMeta(searchId, { sort: search.sort_by === 'score' ? 'name' : 'score' })}
            style={{ background:'none', border:'none', color:'rgba(200,216,184,0.35)', fontFamily: SERIF, fontSize:10, padding:'9px 10px', cursor:'pointer' }}>
            ↕ {search.sort_by === 'score' ? 'Score' : 'A–Z'}
          </button>
        </div>
      </div>

      <div style={{ padding:'10px 12px 100px' }}>
        {/* Benchmark card */}
        {search.filter === 'all' && (() => {
          const bm = scored.find(p => p.is_benchmark)
          if (!bm) return null
          return (
            <div onClick={() => setDetailId(bm.id)}
              style={{ background:'#fffdf0', borderRadius:14, marginBottom:14, cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', border:`2px dashed ${color}77`, padding:'13px 14px 11px' }}>
              <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color, marginBottom:4 }}>📐 Benchmark Property</div>
              <div style={{ fontSize:15, fontWeight:700, color: FOREST }}>{bm.name}</div>
              <div style={{ fontSize:11, color:'#888', marginTop:2, fontStyle:'italic' }}>{bm.location}</div>
              <div style={{ fontSize:11, color, marginTop:6 }}>{typeConfig.benchmarkNote}</div>
            </div>
          )
        })()}

        {/* Property cards */}
        {scored.filter(p => !p.is_benchmark).map(prop => {
          const { g, color: gc, bg: gbg } = grade(prop.score)
          const st = STATUS[prop.status]
          const cc = (prop.comments || []).length
          return (
            <div key={prop.id} onClick={() => setDetailId(prop.id)}
              style={{ background:'#fff', borderRadius:14, marginBottom:10, cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.07)', borderLeft:`4px solid ${st.border}` }}>
              <div style={{ padding:'13px 14px 10px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ flex:1, minWidth:0, paddingRight:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
                      <span style={{ fontSize:11 }}>{st.icon}</span>
                      <span style={{ fontSize:11, color:'#999', fontStyle:'italic' }}>{prop.location}</span>
                      {cc > 0 && <span style={{ fontSize:10, background:'#e8f0fb', color:'#2563a8', borderRadius:10, padding:'1px 6px' }}>💬 {cc}</span>}
                    </div>
                    <div style={{ fontSize:15, fontWeight:700, color: FOREST, lineHeight:1.3 }}>{prop.name}</div>
                    <div style={{ fontSize:11, color:'#888', marginTop:3 }}>
                      {(prop.owner||'Unknown').split(/[,/(]/).slice(0,1).join('').trim()}
                      {prop.acres ? <span style={{ color:'#ccc' }}> · {prop.acres}ac</span> : ''}
                      {prop.cabins != null ? <span style={{ color:'#ccc' }}> · {prop.cabins} cabin{prop.cabins!==1?'s':''}</span> : ''}
                    </div>
                  </div>
                  <div style={{ background: gbg, borderRadius:10, padding:'6px 10px', textAlign:'center', flexShrink:0 }}>
                    <div style={{ fontSize:22, fontWeight:900, color:gc, lineHeight:1 }}>{prop.score}</div>
                    <div style={{ fontSize:10, fontWeight:700, color:gc }}>{g}</div>
                  </div>
                </div>
                {/* Score bars */}
                <div style={{ display:'flex', gap:4, marginTop:10 }}>
                  {typeConfig.criteria.map(({ key, emoji }) => {
                    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
                    const v = prop[key] ?? prop[snakeKey] ?? 0
                    return (
                      <div key={key} style={{ flex:1, textAlign:'center' }}>
                        <div style={{ fontSize:8, marginBottom:2, lineHeight:1 }}>{emoji}</div>
                        <div style={{ height:5, borderRadius:3, background:'#ede8e0' }}>
                          <div style={{ height:'100%', borderRadius:3, width:`${v*10}%`, background:barColor(v) }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}

        {scored.filter(p => !p.is_benchmark).length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 20px', color:'#bbb' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>{typeConfig.icon}</div>
            <div style={{ fontSize:14, marginBottom:8 }}>No properties yet</div>
            <div style={{ fontSize:12 }}>Use the AI chat to find targets, or tap + Add to enter one manually.</div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
