import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import {
  Send, CheckCheck, Lock, Unlock, Wifi, WifiOff, MessageCircle,
  Paperclip, FileText, Download, AlertCircle, Loader2
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../contexts/AuthContext'
import { useHelpCenter } from '../../contexts/HelpCenterContext'
import { helpCenterApi } from '../../api/services'
import { HelpConversation, HelpMessage } from '../../types/data'
import { downloadBlob } from '../../utils/downloadFile'
import { ACCEPTED_ATTACHMENT_ACCEPT, formatBytes, validateAttachmentClientSide } from '../../utils/attachment'

// Renders one message's attachment. The file is always fetched through the authenticated
// download endpoint as a Blob (never a public/static URL) so the server re-checks access
// on every view — including image previews, which are rendered from the resulting
// object URL rather than pointed straight at the API.
const AttachmentBubble: React.FC<{ msg: HelpMessage; isMine: boolean }> = ({ msg, isMine }) => {
  const { t } = useTranslation()
  const [blob, setBlob] = useState<Blob | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [retryToken, setRetryToken] = useState(0)
  const isImage = msg.attachment_mime_type?.startsWith('image/')

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    setLoading(true)
    setError(false)

    helpCenterApi.downloadAttachment(msg.id)
      .then((b) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(b)
        setBlob(b)
        setBlobUrl(objectUrl)
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [msg.id, retryToken])

  const handleDownload = () => {
    if (blob) downloadBlob(blob, msg.attachment_name || 'attachment')
  }

  if (loading) {
    return (
      <div className={clsx('mt-1.5 flex items-center gap-2 text-xs rounded-lg px-3 py-2', isMine ? 'bg-blue-700/40' : 'bg-gray-100 dark:bg-gray-600/40')}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {t('help_attachment_loading')}
      </div>
    )
  }

  if (error || !blobUrl) {
    return (
      <button
        onClick={() => setRetryToken((n) => n + 1)}
        className={clsx('mt-1.5 flex items-center gap-2 text-xs rounded-lg px-3 py-2 w-full text-left', isMine ? 'bg-blue-700/40 hover:bg-blue-700/60' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30')}
      >
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        {t('help_attachment_failed')}
      </button>
    )
  }

  if (isImage) {
    return (
      <a href={blobUrl} target="_blank" rel="noopener noreferrer" className="block mt-1.5 max-w-[240px] rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
        <img src={blobUrl} alt={msg.attachment_name || 'attachment'} className="w-full h-auto max-h-60 object-cover" />
      </a>
    )
  }

  return (
    <button
      onClick={handleDownload}
      className={clsx(
        'mt-1.5 flex items-center gap-2.5 rounded-lg px-3 py-2 w-full max-w-[240px] transition-colors',
        isMine ? 'bg-blue-700/40 hover:bg-blue-700/60' : 'bg-gray-100 dark:bg-gray-600/40 hover:bg-gray-200 dark:hover:bg-gray-600/70'
      )}
    >
      <FileText className="w-6 h-6 shrink-0 opacity-80" />
      <div className="text-left min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{msg.attachment_name}</p>
        <p className="text-[10px] opacity-70">{formatBytes(msg.attachment_size || 0)}</p>
      </div>
      <Download className="w-4 h-4 shrink-0 opacity-70" />
    </button>
  )
}

const HelpCenter: React.FC = () => {
  const { t } = useTranslation()
  const { state: authState } = useAuth()
  const {
    conversations,
    activeConversationId,
    messages,
    connected,
    loading,
    isAdmin,
    selectConversation,
    sendMessage,
    sendAttachment,
    setConversationStatus,
  } = useHelpCenter()

  const [draft, setDraft] = useState('')
  const [uploading, setUploading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Non-admin users only ever have one conversation (their own thread with support) —
  // select it automatically as soon as it's loaded.
  useEffect(() => {
    if (!isAdmin && conversations.length > 0 && activeConversationId !== conversations[0].id) {
      selectConversation(conversations[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, conversations])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === activeConversationId) || null,
    [conversations, activeConversationId]
  )

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    sendMessage(draft)
    setDraft('')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    const clientError = validateAttachmentClientSide(file)
    if (clientError) {
      toast.error(clientError)
      return
    }

    setUploading(true)
    try {
      // The current draft doubles as an optional caption sent alongside the file.
      await sendAttachment(file, draft.trim() || undefined)
      setDraft('')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || t('help_attachment_upload_failed'))
    } finally {
      setUploading(false)
    }
  }

  const otherPartyName = (conv: HelpConversation | null) => {
    if (!conv) return ''
    return isAdmin ? (conv.user?.name || `User #${conv.user_id}`) : 'Algonova Support'
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('help_center')}</h2>
        </div>
        <div className={clsx(
          'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
          connected ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        )}>
          {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {connected ? t('help_connected') : t('help_connecting')}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {isAdmin && (
          <div className="w-full max-w-xs border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{t('help_conversations')}</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading && conversations.length === 0 && (
                <p className="text-sm text-gray-400 p-4">{t('help_loading')}</p>
              )}
              {!loading && conversations.length === 0 && (
                <p className="text-sm text-gray-400 p-4">{t('help_no_conversations')}</p>
              )}
              {conversations.map((conv) => {
                const isActive = conv.id === activeConversationId
                const unread = conv.unread_by_admin
                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={clsx(
                      'w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700/60 transition-colors',
                      isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-800 dark:text-gray-100 truncate">
                        {conv.user?.name || `User #${conv.user_id}`}
                      </span>
                      {unread > 0 && (
                        <span className="shrink-0 bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {conv.last_message || t('help_no_messages_yet')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={clsx(
                        'text-[10px] uppercase tracking-wide font-semibold',
                        conv.status === 'open' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                      )}>
                        {conv.status === 'open' ? t('help_status_open') : t('help_status_closed')}
                      </span>
                      {conv.last_message_at && (
                        <span className="text-[10px] text-gray-400">
                          {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              {isAdmin ? t('help_select_conversation') : t('help_loading')}
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {otherPartyName(activeConversation).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{otherPartyName(activeConversation)}</p>
                    {isAdmin && activeConversation.user?.email && (
                      <p className="text-xs text-gray-400">{activeConversation.user.email}</p>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setConversationStatus(activeConversation.id, activeConversation.status === 'open' ? 'closed' : 'open')}
                    className={clsx(
                      'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
                      activeConversation.status === 'open'
                        ? 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        : 'border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                    )}
                  >
                    {activeConversation.status === 'open' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    {activeConversation.status === 'open' ? t('help_close_conversation') : t('help_reopen_conversation')}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-gray-900/40">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-gray-400 mt-8">{t('help_start_conversation')}</p>
                )}
                {messages.map((msg) => {
                  const isMine = msg.sender_id === authState.user?.id
                  return (
                    <div key={msg.id} className={clsx('flex', isMine ? 'justify-end' : 'justify-start')}>
                      <div className={clsx(
                        'max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm',
                        isMine
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-gray-600'
                      )}>
                        {!isMine && isAdmin === false && (
                          <p className="text-[10px] font-semibold mb-0.5 opacity-70">{msg.sender_role}</p>
                        )}
                        {msg.body && <p className="whitespace-pre-wrap break-words">{msg.body}</p>}
                        {msg.attachment_url && <AttachmentBubble msg={msg} isMine={isMine} />}
                        <p className={clsx('text-[10px] mt-1 flex items-center gap-1', isMine ? 'text-blue-100 justify-end' : 'text-gray-400')}>
                          {format(new Date(msg.created_at), 'HH:mm')}
                          {isMine && <CheckCheck className="w-3 h-3" />}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_ATTACHMENT_ACCEPT}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  title={t('help_attach_file')}
                  className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                </button>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t('help_type_message')}
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || uploading}
                  className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default HelpCenter
