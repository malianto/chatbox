import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAtomValue, useSetAtom } from 'jotai'
import * as dateFns from "date-fns"
import {
    Avatar,
    Box,
    ButtonGroup,
    Grid,
    IconButton,
    TextField,
    Typography,
    useTheme,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import ReplayIcon from '@mui/icons-material/Replay'
import SettingsIcon from '@mui/icons-material/Settings'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import { Message, SessionType } from '../../shared/types'
import {
    showMessageTimestampAtom,
    showModelNameAtom,
    showTokenCountAtom,
    showWordCountAtom,
    openSettingDialogAtom,
    enableMarkdownRenderingAtom,
    currsentSessionPicUrlAtom,
    showTokenUsedAtom,
} from '../stores/atoms'
import * as scrollActions from '../stores/scrollActions'
import { cn } from '../lib/utils'
import Markdown from '@/components/Markdown'
import MessageErrTips from './MessageErrTips'
import { countWord } from '../packages/word-count'
import { estimateTokensFromMessages } from '../packages/token'

import '../static/Block.css'

export interface Props {
    id?: string
    sessionId: string
    sessionType: SessionType
    msg: Message
    className?: string
    collapseThreshold?: number
    hiddenButtonGroup?: boolean
    small?: boolean
    onEdit?: (messageId: string, newContent: string) => void
    onDelete?: (messageId: string) => void
    onRegenerate?: (messageId: string) => void
}

export default function Message(props: Props) {
    const { t } = useTranslation()
    const theme = useTheme()

    const showMessageTimestamp = useAtomValue(showMessageTimestampAtom)
    const showModelName = useAtomValue(showModelNameAtom)
    const showTokenCount = useAtomValue(showTokenCountAtom)
    const showWordCount = useAtomValue(showWordCountAtom)
    const showTokenUsed = useAtomValue(showTokenUsedAtom)
    const enableMarkdownRendering = useAtomValue(enableMarkdownRenderingAtom)
    const currentSessionPicUrl = useAtomValue(currsentSessionPicUrlAtom)
    const setOpenSettingWindow = useSetAtom(openSettingDialogAtom)

    const { msg, className, collapseThreshold, hiddenButtonGroup, small, onEdit, onDelete, onRegenerate } = props

    const needCollapse = collapseThreshold
        && (JSON.stringify(msg.content)).length > collapseThreshold
        && (JSON.stringify(msg.content)).length - collapseThreshold > 50
    const [isCollapsed, setIsCollapsed] = useState(needCollapse)

    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState('')

    const ref = useRef<HTMLDivElement>(null)

    const tips: string[] = []
    if (props.sessionType === 'chat' || !props.sessionType) {
        if (showWordCount && !msg.generating) {
            tips.push(`word count: ${msg.wordCount !== undefined ? msg.wordCount : countWord(msg.content)}`)
        }
        if (showTokenCount && !msg.generating) {
            if (msg.tokenCount === undefined) {
                msg.tokenCount = estimateTokensFromMessages([msg])
            }
            tips.push(`token count: ${msg.tokenCount}`)
        }
        if (showTokenUsed && msg.role === 'assistant' && !msg.generating) {
            tips.push(`tokens used: ${msg.tokensUsed || 'unknown'}`)
        }
        if (showModelName && props.msg.role === 'assistant') {
            tips.push(`model: ${props.msg.model || 'unknown'}`)
        }
    }

    if (showMessageTimestamp && msg.timestamp !== undefined) {
        let date = new Date(msg.timestamp)
        let messageTimestamp: string
        if (dateFns.isToday(date)) {
            messageTimestamp = dateFns.format(date, 'HH:mm')
        } else if (dateFns.isThisYear(date)) {
            messageTimestamp = dateFns.format(date, 'MM-dd HH:mm')
        } else {
            messageTimestamp = dateFns.format(date, 'yyyy-MM-dd HH:mm')
        }

        tips.push('time: ' + messageTimestamp)
    }

    useEffect(() => {
        if (msg.generating) {
            scrollActions.scrollToBottom()
        }
    }, [msg.content])

    let content = msg.content
    if (typeof msg.content !== 'string') {
        content = JSON.stringify(msg.content)
    }
    if (msg.generating) {
        content += '...'
    }
    if (needCollapse && isCollapsed) {
        content = msg.content.slice(0, collapseThreshold) + '... '
    }

    const CollapseButton = (
        <span
            className='cursor-pointer inline-block font-bold text-blue-500 hover:text-white hover:bg-blue-500'
            onClick={() => setIsCollapsed(!isCollapsed)}
        >
            [{isCollapsed ? t('Expand') : t('Collapse')}]
        </span>
    )

    const handleEdit = () => {
        setEditContent(content)
        setIsEditing(true)
    }

    const handleSave = () => {
        if (onEdit) {
            onEdit(msg.id, editContent)
        }
        setIsEditing(false)
    }

    const handleCancel = () => {
        setIsEditing(false)
        setEditContent('')
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(content)
    }

    const MessageControls = (
        <Box 
            className="hidden group-hover/message:inline-flex" 
            sx={{ 
                position: 'absolute', 
                left: '52px', 
                bottom: '8px',
                backgroundColor: 'background.paper',
                boxShadow: 1,
                borderRadius: 1,
                padding: '2px',
                zIndex: 1,
            }}
        >
            <ButtonGroup variant="contained" size="small">
                {msg.role === 'assistant' && onRegenerate && (
                    <IconButton
                        color="primary"
                        aria-label="regenerate"
                        onClick={() => onRegenerate(msg.id)}
                    >
                        <ReplayIcon fontSize="small" />
                    </IconButton>
                )}
                {!msg.generating && onEdit && (
                    <IconButton
                        color="primary"
                        aria-label="edit"
                        onClick={handleEdit}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                )}
                {!msg.generating && (
                    <IconButton
                        color="primary"
                        aria-label="copy"
                        onClick={handleCopy}
                    >
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                )}
                {!msg.generating && onDelete && (
                    <IconButton
                        color="primary"
                        aria-label="delete"
                        onClick={() => onDelete(msg.id)}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                )}
            </ButtonGroup>
        </Box>
    )

    return (
        <Box
            ref={ref}
            id={props.id}
            key={msg.id}
            className={cn(
                'group/message relative',
                'msg-block',
                'px-2',
                msg.generating ? 'rendering' : 'render-done',
                {
                    user: 'user-msg',
                    system: 'system-msg',
                    assistant: 'assistant-msg',
                }[msg?.role || 'user'],
                className,
            )}
            sx={{
                margin: '0',
                paddingBottom: '0.1rem',
                paddingX: '1rem',
                [theme.breakpoints.down('sm')]: {
                    paddingX: '0.3rem',
                },
            }}
        >
            {!hiddenButtonGroup && !isEditing && MessageControls}
            <Grid container wrap="nowrap" spacing={1.5}>
                <Grid item>
                    <Box sx={{ marginTop: '8px' }}>
                        {
                            {
                                assistant: currentSessionPicUrl ? (
                                    <Avatar
                                        src={currentSessionPicUrl}
                                        sx={{
                                            width: '28px',
                                            height: '28px',
                                        }}
                                    />
                                ) : (
                                    <Avatar
                                        sx={{
                                            backgroundColor: theme.palette.primary.main,
                                            width: '28px',
                                            height: '28px',
                                        }}
                                    >
                                        <SmartToyIcon fontSize='small' />
                                    </Avatar>
                                ),
                                user: (
                                    <Avatar
                                        sx={{
                                            width: '28px',
                                            height: '28px',
                                        }}
                                        className='cursor-pointer'
                                        onClick={() => setOpenSettingWindow('chat')}
                                    >
                                        <PersonIcon fontSize='small' />
                                    </Avatar>
                                ),
                                system:
                                        <Avatar
                                            sx={{
                                                backgroundColor: theme.palette.warning.main,
                                                width: '28px',
                                                height: '28px',
                                            }}
                                        >
                                            <SettingsIcon fontSize='small' />
                                        </Avatar>
                            }[msg.role]
                        }
                    </Box>
                </Grid>
                <Grid item xs sm container sx={{ width: '0px', paddingRight: '15px' }}>
                    <Grid item xs>
                        <Box className={cn('msg-content', { 'msg-content-small': small })} sx={
                            small ? { fontSize: theme.typography.body2.fontSize } : {
                                paddingBottom: '40px'
                            }
                        }>
                            {isEditing ? (
                                <Box>
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={4}
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[100],
                                            }
                                        }}
                                    />
                                    <Box sx={{ mt: 1 }}>
                                        <ButtonGroup variant="contained" size="small">
                                            <IconButton
                                                color="primary"
                                                onClick={handleSave}
                                                sx={{ borderRadius: 1 }}
                                            >
                                                <CheckIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                color="primary"
                                                onClick={handleCancel}
                                                sx={{ borderRadius: 1 }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </ButtonGroup>
                                    </Box>
                                </Box>
                            ) : (
                                enableMarkdownRendering && !isCollapsed ? (
                                    <Markdown>
                                        {content}
                                    </Markdown>
                                ) : (
                                    <div>
                                        {content}
                                        {
                                            needCollapse && isCollapsed && (
                                                CollapseButton
                                            )
                                        }
                                    </div>
                                )
                            )}
                        </Box>
                        <MessageErrTips msg={msg} />
                        {
                            needCollapse && !isCollapsed && CollapseButton
                        }
                        <Typography variant="body2" sx={{ opacity: 0.5, paddingBottom: '2rem' }}>
                            {tips.join(', ')}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    )
}
