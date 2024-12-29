import { useEffect, useRef } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { v4 as uuidv4 } from 'uuid'
import Message from './Message'
import { Message as MessageType } from '../../shared/types'
import * as atoms from '../stores/atoms'
import * as sessionActions from '../stores/sessionActions'
import { cn } from '../lib/utils'
import { countWord } from '../packages/word-count'
import { estimateTokensFromMessages } from '../packages/token'

interface Props { }

export default function MessageList(props: Props) {
    const currentSession = useAtomValue(atoms.currentSessionAtom)
    const [sessions, setSessions] = useAtom(atoms.sessionsAtom)
    const currentMessageList = useAtomValue(atoms.currentMessageListAtom)
    const ref = useRef<HTMLDivElement | null>(null)
    const [, setMessageListRef] = useAtom(atoms.messageListRefAtom)

    useEffect(() => {
        setMessageListRef(ref)
    }, [ref])

    const handleEdit = (messageId: string, newContent: string) => {
        setSessions(sessions.map(session => {
            if (session.id === currentSession.id) {
                return {
                    ...session,
                    messages: session.messages?.map(msg => 
                        msg.id === messageId ? {
                            ...msg,
                            content: newContent,
                            wordCount: countWord(newContent),
                            tokenCount: estimateTokensFromMessages([{ ...msg, content: newContent }])
                        } : msg
                    )
                }
            }
            return session
        }))
    }

    const handleDelete = (messageId: string) => {
        setSessions(sessions.map(session => {
            if (session.id === currentSession.id) {
                return {
                    ...session,
                    messages: session.messages?.filter(msg => msg.id !== messageId)
                }
            }
            return session
        }))
    }

    const handleRegenerate = (messageId: string) => {
        // Find the message and its index
        const messageIndex = currentMessageList.findIndex(msg => msg.id === messageId)
        if (messageIndex === -1) return

        // Get the message to regenerate
        const messageToRegenerate = currentMessageList[messageIndex]

        // Create a new message for regeneration
        const newMessage: MessageType = {
            ...messageToRegenerate,
            id: uuidv4(),
            content: '',
            generating: true,
        }

        // Update the session with the new message
        setSessions(sessions.map(session => {
            if (session.id === currentSession.id) {
                return {
                    ...session,
                    messages: [
                        ...session.messages!.slice(0, messageIndex),
                        newMessage
                    ]
                }
            }
            return session
        }))

        // Trigger message generation
        sessionActions.generate(currentSession.id, newMessage)
    }

    return (
        <div className='overflow-y-auto w-full h-full pr-0 pl-0' ref={ref}>
            {
                currentMessageList.map((msg, index) => (
                    <Message
                        id={msg.id}
                        key={'msg-' + msg.id}
                        msg={msg}
                        sessionId={currentSession.id}
                        sessionType={currentSession.type || 'chat'}
                        className={index === 0 ? 'pt-4' : ''}
                        collapseThreshold={msg.role === 'system' ? 150 : undefined}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onRegenerate={handleRegenerate}
                    />
                ))
            }
        </div>
    )
}
