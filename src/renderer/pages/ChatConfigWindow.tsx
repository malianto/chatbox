import React, { useEffect } from 'react'
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    Tooltip,
    Button,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {
    Session,
    Settings,
    ModelProvider,
} from '../../shared/types'
import { useTranslation } from 'react-i18next'
import * as sessionActions from '../stores/sessionActions'
import { useAtom } from 'jotai'
import { trackingEvent } from '@/packages/event'
import { AIModelProviderMenuOptionList } from '../packages/models'
import OpenAIModelSelect from '../components/OpenAIModelSelect'
import { models as openaiModels } from '../packages/models/openai'
import { chatboxAIModels } from '../packages/models/chatboxai'
import { default as Ollama } from '../packages/models/ollama'
import { models as siliconflowModels } from '../packages/models/siliconflow'
import * as atoms from '../stores/atoms'

interface Props {
}

export default function ChatConfigWindow(props: Props) {
    const { t } = useTranslation()
    const [chatConfigDialogSession, setChatConfigDialogSession] = useAtom(atoms.chatConfigDialogAtom)
    const [settings] = useAtom(atoms.settingsAtom)

    const [editingData, setEditingData] = React.useState<Session | null>(chatConfigDialogSession)
    const [systemPrompt, setSystemPrompt] = React.useState('')
    const [expanded, setExpanded] = React.useState(false)

    useEffect(() => {
        if (!chatConfigDialogSession) {
            setEditingData(null)
        } else {
            setEditingData({
                ...chatConfigDialogSession,
                // Only set defaults if values are undefined
                aiProvider: chatConfigDialogSession.aiProvider ?? settings.aiProvider,
                model: chatConfigDialogSession.model ?? settings.model,
                temperature: chatConfigDialogSession.temperature ?? settings.temperature,
                topP: chatConfigDialogSession.topP ?? settings.topP,
                maxTokens: chatConfigDialogSession.maxTokens ?? settings.maxTokens,
            })
        }
    }, [chatConfigDialogSession])

    useEffect(() => {
        if (!editingData) {
            return
        }
        const systemMessage = editingData.messages.find((msg) => msg.role === 'system')
        setSystemPrompt(systemMessage?.content || '')
    }, [editingData])

    const onCancel = () => {
        trackingEvent('chat_config_cancel')
        setChatConfigDialogSession(null)
        setEditingData(null)
    }

    const onSave = () => {
        if (!chatConfigDialogSession || !editingData) {
            return
        }
        trackingEvent('chat_config_save')
        const messages = [...editingData.messages]
        const systemMessageIndex = messages.findIndex((msg) => msg.role === 'system')
        if (systemMessageIndex >= 0) {
            messages[systemMessageIndex] = { ...messages[systemMessageIndex], content: systemPrompt }
        }
        sessionActions.modify({
            ...editingData,
            messages,
            aiProvider: editingData.aiProvider,
            model: editingData.model,
            temperature: editingData.temperature,
            topP: editingData.topP,
            maxTokens: editingData.maxTokens,
        })
        setChatConfigDialogSession(null)
        setEditingData(null)
    }

    const handleCopySystemPrompt = () => {
        navigator.clipboard.writeText(systemPrompt)
    }

    if (!chatConfigDialogSession || !editingData) {
        return null
    }

    const currentProvider = editingData.aiProvider || settings.aiProvider

    const getModelsForProvider = (provider: ModelProvider) => {
        switch (provider) {
            case ModelProvider.ChatboxAI:
                return chatboxAIModels
            case ModelProvider.OpenAI:
                return openaiModels
            case ModelProvider.Ollama:
                return ['llama2', 'codellama', 'mistral'] // Default Ollama models
            case ModelProvider.SiliconFlow:
                return siliconflowModels
            default:
                return []
        }
    }

    const currentModels = getModelsForProvider(currentProvider)

    return (
        <Dialog open={!!chatConfigDialogSession} onClose={onCancel} fullWidth>
            <DialogTitle>{t('Conversation Settings')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('Configure your conversation settings below.')}
                </DialogContentText>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label={t('Name')}
                        fullWidth
                        value={editingData.name}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                    />

                    <Box sx={{ position: 'relative' }}>
                        <TextField
                            label={t('System Prompt')}
                            fullWidth
                            multiline
                            rows={4}
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                        />
                        <Tooltip title={t('Copy')}>
                            <IconButton 
                                sx={{ position: 'absolute', right: 8, top: 8 }}
                                onClick={handleCopySystemPrompt}
                            >
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    
                    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>{t('Model Settings')}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{t('AI Provider')}</InputLabel>
                                    <Select
                                        value={currentProvider}
                                        label={t('AI Provider')}
                                        onChange={(e) => {
                                            const newProvider = e.target.value as ModelProvider
                                            const models = getModelsForProvider(newProvider)
                                            setEditingData({
                                                ...editingData,
                                                aiProvider: newProvider,
                                                model: models[0]
                                            })
                                        }}
                                    >
                                        {AIModelProviderMenuOptionList.map((provider) => (
                                            <MenuItem 
                                                key={provider.value} 
                                                value={provider.value}
                                                sx={provider.featured ? { fontWeight: 'bold' } : {}}
                                            >
                                                {provider.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {currentProvider === ModelProvider.OpenAI ? (
                                    <OpenAIModelSelect
                                        model={editingData.model || settings.model}
                                        openaiCustomModel={editingData.openaiCustomModel}
                                        onChange={(model, customModel) => 
                                            setEditingData({ ...editingData, model, openaiCustomModel: customModel })}
                                    />
                                ) : (
                                    <FormControl fullWidth>
                                        <InputLabel>{t('Model')}</InputLabel>
                                        <Select
                                            value={editingData.model || settings.model}
                                            label={t('Model')}
                                            onChange={(e) => setEditingData({ ...editingData, model: e.target.value })}
                                        >
                                            {currentModels.map((model) => (
                                                <MenuItem key={model} value={model}>
                                                    {model}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}

                                <TextField
                                    type="number"
                                    label={t('Temperature')}
                                    fullWidth
                                    value={editingData.temperature ?? settings.temperature}
                                    onChange={(e) => setEditingData({ 
                                        ...editingData, 
                                        temperature: parseFloat(e.target.value) 
                                    })}
                                    inputProps={{ step: 0.1, min: 0, max: 2 }}
                                />

                                <TextField
                                    type="number"
                                    label={t('Top P')}
                                    fullWidth
                                    value={editingData.topP ?? settings.topP}
                                    onChange={(e) => setEditingData({ 
                                        ...editingData, 
                                        topP: parseFloat(e.target.value) 
                                    })}
                                    inputProps={{ step: 0.1, min: 0, max: 1 }}
                                />

                                <TextField
                                    type="number"
                                    label={t('Max Tokens')}
                                    fullWidth
                                    value={editingData.maxTokens ?? settings.maxTokens}
                                    onChange={(e) => setEditingData({ 
                                        ...editingData, 
                                        maxTokens: parseInt(e.target.value) 
                                    })}
                                    inputProps={{ step: 100, min: 100 }}
                                />
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>{t('Cancel')}</Button>
                <Button onClick={onSave} variant="contained">
                    {t('Save')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
