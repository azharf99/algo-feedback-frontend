import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'
import { helpCenterApi } from '../api/services'
import { getHelpCenterWsUrl } from '../api/ws'
import { HelpConversation, HelpMessage } from '../types/data'

// Inbound payloads pushed by the backend WebSocket hub (see pkg/ws + help_center_handler.go)
type InboundEvent =
  | { type: 'message'; conversation: HelpConversation; data: HelpMessage }
  | { type: 'read'; conversation: HelpConversation }
  | { type: 'error'; error: string }

interface HelpCenterContextType {
  conversations: HelpConversation[]
  activeConversationId: number | null
  messages: HelpMessage[]
  connected: boolean
  loading: boolean
  totalUnread: number
  isAdmin: boolean
  refreshConversations: () => Promise<void>
  selectConversation: (id: number) => Promise<void>
  sendMessage: (body: string) => void
  // Uploads a file attachment as a new message. Throws on failure (invalid type, too
  // large, network error) so the caller can show an inline error near the composer.
  sendAttachment: (file: File, caption?: string) => Promise<void>
  setConversationStatus: (id: number, status: 'open' | 'closed') => Promise<void>
}

const HelpCenterContext = createContext<HelpCenterContextType | undefined>(undefined)

export const useHelpCenter = () => {
  const ctx = useContext(HelpCenterContext)
  if (!ctx) {
    throw new Error('useHelpCenter must be used within a HelpCenterProvider')
  }
  return ctx
}

const MAX_RECONNECT_DELAY = 15000

export const HelpCenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state: authState } = useAuth()
  const { isAuthenticated, user } = authState
  const isAdmin = user?.role === 'Admin'

  const [conversations, setConversations] = useState<HelpConversation[]>([])
  const [messagesByConversation, setMessagesByConversation] = useState<Record<number, HelpMessage[]>>({})
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const activeConversationIdRef = useRef<number | null>(null)
  const isAdminRef = useRef(isAdmin)
  const userIdRef = useRef<number | undefined>(user?.id)

  useEffect(() => { activeConversationIdRef.current = activeConversationId }, [activeConversationId])
  useEffect(() => { isAdminRef.current = isAdmin }, [isAdmin])
  useEffect(() => { userIdRef.current = user?.id }, [user?.id])

  const upsertConversation = useCallback((conv: HelpConversation) => {
    setConversations(prev => {
      const idx = prev.findIndex(c => c.id === conv.id)
      const next = idx === -1 ? [conv, ...prev] : prev.map(c => (c.id === conv.id ? conv : c))
      return [...next].sort((a, b) => {
        const at = new Date(a.last_message_at || a.updated_at).getTime()
        const bt = new Date(b.last_message_at || b.updated_at).getTime()
        return bt - at
      })
    })
  }, [])

  const appendMessage = useCallback((conversationId: number, msg: HelpMessage) => {
    setMessagesByConversation(prev => {
      const list = prev[conversationId] || []
      if (list.some(m => m.id === msg.id)) return prev
      return { ...prev, [conversationId]: [...list, msg] }
    })
  }, [])

  const handleIncoming = useCallback((raw: string) => {
    let payload: InboundEvent
    try {
      payload = JSON.parse(raw)
    } catch {
      return
    }

    if (payload.type === 'message') {
      const { conversation, data } = payload
      upsertConversation(conversation)
      appendMessage(conversation.id, data)

      const isMine = data.sender_id === userIdRef.current
      const isViewingThisThread = activeConversationIdRef.current === conversation.id
      if (!isMine && !isViewingThisThread) {
        const from = isAdminRef.current ? (conversation.user?.name || 'User') : 'Algonova Support'
        const preview = data.body || (data.attachment_name ? `📎 ${data.attachment_name}` : '')
        toast(`${from}: ${preview}`, { icon: '💬' })
      }
    } else if (payload.type === 'read') {
      upsertConversation(payload.conversation)
    } else if (payload.type === 'error') {
      toast.error(payload.error)
    }
  }, [appendMessage, upsertConversation])

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }

  const connect = useCallback(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    clearReconnectTimer()
    const socket = new WebSocket(getHelpCenterWsUrl(token))

    socket.onopen = () => {
      setConnected(true)
      reconnectAttemptsRef.current = 0
    }
    socket.onmessage = (evt) => handleIncoming(evt.data)
    socket.onclose = () => {
      setConnected(false)
      wsRef.current = null
      // Exponential backoff reconnect while the user is still logged in.
      const attempt = Math.min(reconnectAttemptsRef.current + 1, 10)
      reconnectAttemptsRef.current = attempt
      const delay = Math.min(1000 * 2 ** attempt, MAX_RECONNECT_DELAY)
      reconnectTimerRef.current = setTimeout(() => {
        if (localStorage.getItem('accessToken')) connect()
      }, delay)
    }
    socket.onerror = () => socket.close()

    wsRef.current = socket
  }, [handleIncoming])

  const disconnect = useCallback(() => {
    clearReconnectTimer()
    reconnectAttemptsRef.current = 0
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.close()
      wsRef.current = null
    }
    setConnected(false)
  }, [])

  const refreshConversations = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      if (isAdmin) {
        const res = await helpCenterApi.getConversations({ limit: 50, sort_by: 'last_message_at', sort_dir: 'desc' }, true)
        setConversations(res.data)
      } else {
        const conv = await helpCenterApi.getMyConversation(true)
        setConversations([conv])
      }
    } catch {
      // Silently ignore — chat is a secondary feature, don't block the rest of the app.
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, isAdmin])

  const markRead = useCallback(async (id: number) => {
    try {
      await helpCenterApi.markRead(id)
      setConversations(prev => prev.map(c => {
        if (c.id !== id) return c
        return isAdmin ? { ...c, unread_by_admin: 0 } : { ...c, unread_by_user: 0 }
      }))
    } catch {
      // Best-effort; unread count will resync on next refresh.
    }
  }, [isAdmin])

  const selectConversation = useCallback(async (id: number) => {
    setActiveConversationId(id)
    if (!messagesByConversation[id]) {
      try {
        const res = await helpCenterApi.getMessages(id, { limit: 50 }, true)
        setMessagesByConversation(prev => ({ ...prev, [id]: res.data }))
      } catch {
        // ignore
      }
    }
    markRead(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markRead])

  const sendMessage = useCallback((body: string) => {
    const trimmed = body.trim()
    if (!trimmed) return

    const conversationId = isAdmin ? (activeConversationIdRef.current ?? undefined) : undefined
    if (isAdmin && !conversationId) return

    const socket = wsRef.current
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'message', conversation_id: conversationId ?? 0, body: trimmed }))
    } else {
      helpCenterApi.sendMessage(trimmed, conversationId)
        .then(({ data, conversation }) => {
          upsertConversation(conversation)
          appendMessage(conversation.id, data)
        })
        .catch(() => toast.error('Failed to send message'))
    }
  }, [isAdmin, appendMessage, upsertConversation])

  const sendAttachment = useCallback(async (file: File, caption?: string) => {
    const conversationId = isAdmin ? (activeConversationIdRef.current ?? undefined) : undefined
    if (isAdmin && !conversationId) {
      throw new Error('Select a conversation first')
    }

    // Sent over REST only (not the WebSocket text channel) — the server still broadcasts
    // the resulting message over the socket to every connected participant, so this stays
    // real-time; appendMessage's id-based dedupe absorbs that echo if it arrives too.
    const { data, conversation } = await helpCenterApi.sendAttachment(file, caption, conversationId)
    upsertConversation(conversation)
    appendMessage(conversation.id, data)
  }, [isAdmin, appendMessage, upsertConversation])

  const setConversationStatus = useCallback(async (id: number, status: 'open' | 'closed') => {
    await helpCenterApi.updateStatus(id, status)
    setConversations(prev => prev.map(c => (c.id === id ? { ...c, status } : c)))
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      refreshConversations()
      connect()
    } else {
      disconnect()
      setConversations([])
      setMessagesByConversation({})
      setActiveConversationId(null)
    }
    return () => disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const messages = useMemo(
    () => (activeConversationId ? (messagesByConversation[activeConversationId] || []) : []),
    [activeConversationId, messagesByConversation]
  )

  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (isAdmin ? c.unread_by_admin : c.unread_by_user), 0)
  }, [conversations, isAdmin])

  const value: HelpCenterContextType = useMemo(() => ({
    conversations,
    activeConversationId,
    messages,
    connected,
    loading,
    totalUnread,
    isAdmin,
    refreshConversations,
    selectConversation,
    sendMessage,
    sendAttachment,
    setConversationStatus,
  }), [conversations, activeConversationId, messages, connected, loading, totalUnread, isAdmin, refreshConversations, selectConversation, sendMessage, sendAttachment, setConversationStatus])

  return <HelpCenterContext.Provider value={value}>{children}</HelpCenterContext.Provider>
}
