import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';

/* eslint-disable no-bitwise */
const VALUES = {
	alert: { value: 1 << 2, key: 'COMMAND_SETFILTERMODE_ALERT' },
	delete: { value: 1 << 0, key: 'COMMAND_SETFILTERMODE_DELETE' },
	log: { value: 1 << 1, key: 'COMMAND_SETFILTERMODE_LOG' }
};

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			cooldown: 5,
			description: (language) => language.get('COMMAND_SETFILTERMODE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SETFILTERMODE_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			usage: '<delete|log|alert|show:default> [enable|disable]',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [type, mode = 'enable']: [string, string?]) {
		const level = message.guild.settings.get('filter.level') as number;
		if (type === 'show') {
			return message.sendLocale('COMMAND_SETFILTERMODE_SHOW', [
				level & VALUES.alert.value,
				level & VALUES.log.value,
				level & VALUES.delete.value
			], { code: 'asciidoc' });
		}

		const { value, key } = VALUES[type];
		const enable = mode === 'enable';
		const changed = enable
			? level | value
			: level & ~value;
		if (level === changed) throw message.language.get('COMMAND_SETFILTERMODE_EQUALS');
		await message.guild.settings.update('filter.level', changed);

		return message.sendLocale(key, [enable]);
	}

}