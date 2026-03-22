import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'

// ─── useSearches hook ─────────────────────────────────────────────────────────
// Loads all searches + properties from Supabase, provides CRUD operations

export function useSearches() {
  const [searches, setSearches] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load all data
  const load = useCallback(async () => {
    try {
      setLoading(true)

      // Load searches
      const { data: searchRows, error: sErr } = await supabase
        .from('searches')
        .select('*')
        .order('created_at', { ascending: true })
      if (sErr) throw sErr

      // Load properties
      const { data: propRows, error: pErr } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: true })
      if (pErr) throw pErr

      // Load comments
      const { data: commentRows, error: cErr } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: true })
      if (cErr) throw cErr

      // Load chat messages
      const { data: chatRows, error: chatErr } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
      if (chatErr) throw chatErr

      // Assemble
      const assembled = {}
      for (const s of searchRows) {
        const props = propRows
          .filter(p => p.search_id === s.id)
          .map(p => ({
            ...p,
            comments: commentRows.filter(c => c.property_id === p.id)
          }))
        const chat = chatRows
          .filter(m => m.search_id === s.id)
          .map(m => ({ role: m.role, content: m.content }))

        assembled[s.id] = {
          ...s,
          properties: props,
          chat: chat.length > 0 ? chat : [{ role:'assistant', content:`Welcome to **${s.name}**! I'm ready to help you find properties. What should we look for first?` }]
        }
      }

      setSearches(assembled)
    } catch (err) {
      console.error('Load error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── SEARCH OPERATIONS ───────────────────────────────────────────────────

  async function createSearch({ name, typeId }) {
    const { data, error } = await supabase
      .from('searches')
      .insert({ name, type_id: typeId, filter: 'all', sort_by: 'score' })
      .select()
      .single()
    if (error) throw error
    setSearches(prev => ({
      ...prev,
      [data.id]: { ...data, properties: [], chat: [{ role:'assistant', content:`Welcome to **${name}**! Ready to find properties. What's first?` }] }
    }))
    return data.id
  }

  async function updateSearchMeta(searchId, patch) {
    const dbPatch = {}
    if (patch.filter !== undefined) dbPatch.filter = patch.filter
    if (patch.sort !== undefined) dbPatch.sort_by = patch.sort
    if (Object.keys(dbPatch).length > 0) {
      await supabase.from('searches').update(dbPatch).eq('id', searchId)
    }
    setSearches(prev => ({ ...prev, [searchId]: { ...prev[searchId], ...patch } }))
  }

  // ── PROPERTY OPERATIONS ─────────────────────────────────────────────────

  async function addProperty(searchId, prop) {
    const { comments, score, ...rest } = prop
    const { data, error } = await supabase
      .from('properties')
      .insert({ ...rest, search_id: searchId })
      .select()
      .single()
    if (error) throw error
    const newProp = { ...data, comments: [] }
    setSearches(prev => ({
      ...prev,
      [searchId]: { ...prev[searchId], properties: [...prev[searchId].properties, newProp] }
    }))
    return data
  }

  async function updateProperty(searchId, propId, patch) {
    // Optimistic update
    setSearches(prev => ({
      ...prev,
      [searchId]: {
        ...prev[searchId],
        properties: prev[searchId].properties.map(p => p.id === propId ? { ...p, ...patch } : p)
      }
    }))
    // DB update (exclude computed fields)
    const { comments, score, ...dbPatch } = patch
    if (Object.keys(dbPatch).length > 0) {
      await supabase.from('properties').update(dbPatch).eq('id', propId)
    }
  }

  // ── COMMENT OPERATIONS ──────────────────────────────────────────────────

  async function addComment(searchId, propId, text) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ property_id: propId, text })
      .select()
      .single()
    if (error) throw error
    setSearches(prev => ({
      ...prev,
      [searchId]: {
        ...prev[searchId],
        properties: prev[searchId].properties.map(p =>
          p.id === propId ? { ...p, comments: [...(p.comments||[]), data] } : p
        )
      }
    }))
  }

  async function deleteComment(searchId, propId, commentId) {
    await supabase.from('comments').delete().eq('id', commentId)
    setSearches(prev => ({
      ...prev,
      [searchId]: {
        ...prev[searchId],
        properties: prev[searchId].properties.map(p =>
          p.id === propId ? { ...p, comments: (p.comments||[]).filter(c => c.id !== commentId) } : p
        )
      }
    }))
  }

  // ── CHAT OPERATIONS ─────────────────────────────────────────────────────

  async function appendChatMessage(searchId, role, content) {
    await supabase.from('chat_messages').insert({ search_id: searchId, role, content })
    setSearches(prev => ({
      ...prev,
      [searchId]: {
        ...prev[searchId],
        chat: [...(prev[searchId].chat || []), { role, content }]
      }
    }))
  }

  async function setChatMessages(searchId, messages) {
    // Replace local state only (used for optimistic updates during streaming)
    setSearches(prev => ({
      ...prev,
      [searchId]: { ...prev[searchId], chat: messages }
    }))
  }

  return {
    searches,
    loading,
    error,
    reload: load,
    createSearch,
    updateSearchMeta,
    addProperty,
    updateProperty,
    addComment,
    deleteComment,
    appendChatMessage,
    setChatMessages,
  }
}
