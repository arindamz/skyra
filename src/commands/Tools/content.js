const { Command, Serializer, util: { getContent } } = require('../../index');
const SNOWFLAKE_REGEXP = Serializer.regex.snowflake;

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['source', 'msg-source', 'message-source'],
			cooldown: 15,
			description: (language) => language.get('COMMAND_CONTENT_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_CONTENT_EXTENDED'),
			runIn: ['text'],
			usage: '[channel:channel] (message:message)',
			usageDelim: ' '
		});

		this.createCustomResolver('message', async (arg, possible, msg, [channel = msg.channel]) => {
			if (!arg || !SNOWFLAKE_REGEXP.test(arg)) throw msg.language.get('RESOLVER_INVALID_MSG', 'Message');
			const message = await channel.messages.fetch(arg).catch(() => null);
			if (message) return message;
			throw msg.language.get('SYSTEM_MESSAGE_NOT_FOUND');
		});
	}

	async run(msg, [, message]) {
		const attachments = message.attachments.size
			? message.attachments.map(att => `📁 <${att.url}>`).join('\n')
			: '';
		const content = getContent(message);
		return msg.sendMessage(`${content || ''}${content ? `\n\n\n=============\n${attachments}` : attachments}`, { code: 'md' });
	}

};
