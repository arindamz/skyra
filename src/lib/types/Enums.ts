export enum Events {
	ApiError = 'apiError',
	CommandError = 'commandError',
	CommandInhibited = 'commandInhibited',
	CommandSuccess = 'commandSuccess',
	CommandUnknown = 'commandUnknown',
	CoreSettingsDelete = 'coreSettingsDelete',
	CoreSettingsUpdate = 'coreSettingsUpdate',
	Debug = 'debug',
	Disconnect = 'disconnect',
	Error = 'error',
	EventError = 'eventError',
	FinalizerError = 'finalizerError',
	GuildBanAdd = 'guildBanAdd',
	GuildBanRemove = 'guildBanRemove',
	GuildCreate = 'guildCreate',
	GuildDelete = 'guildDelete',
	GuildMessageLog = 'guildMessageLog',
	KlasaReady = 'klasaReady',
	Log = 'log',
	MentionSpamExceeded = 'mentionSpamExceeded',
	MentionSpamWarning = 'mentionSpamWarning',
	Message = 'message',
	MessageDelete = 'messageDelete',
	MessageDeleteBulk = 'messageDeleteBulk',
	MessageUpdate = 'messageUpdate',
	MonitorError = 'monitorError',
	Raw = 'raw',
	Reconnecting = 'reconnecting',
	TaskError = 'taskError',
	UnhandledRejection = 'unhandledRejection',
	Verbose = 'verbose',
	Warn = 'warn',
	Wtf = 'wtf'
}