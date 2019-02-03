import { Role } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage, util } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { GuildSettingsRolesReactions } from '../../../lib/types/Misc';
import { resolveEmoji } from '../../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_MANAGEROLEREACTION_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_MANAGEROLEREACTION_EXTENDED'),
			permissionLevel: 6,
			quotedStringSupport: true,
			requiredPermissions: ['READ_MESSAGE_HISTORY', 'ADD_REACTIONS'],
			runIn: ['text'],
			subcommands: true,
			usage: '<show|add|remove|reset> (role:rolename) (emoji:emoji)',
			usageDelim: ' ',
		});

		this.createCustomResolver('emoji', async(arg, _, msg, [action = 'show']) => {
			if (action === 'show' || action === 'reset') return undefined;
			if (!arg) throw msg.language.get('COMMAND_MANAGEROLEREACTION_REQUIRED_REACTION');

			try {
				arg = resolveEmoji(arg);
				await msg.react(arg);
				return arg;
			} catch (_) {
				throw msg.language.get('COMMAND_TRIGGERS_INVALIDREACTION');
			}
		}).createCustomResolver('rolename', (arg, possible, msg, [action = 'show']) => {
			if (action !== 'add') return undefined;
			if (!arg) throw msg.language.get('COMMAND_MANAGEROLEREACTION_REQUIRED_ROLE');
			return this.client.arguments.get('rolename').run(arg, possible, msg);
		});
	}

	public async show(message: KlasaMessage) {
		const list = new Set(message.guild.settings.get('roles.reactions') as GuildSettingsRolesReactions);
		const oldLength = list.size;
		if (!list.size) throw message.language.get('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		const lines = [];
		for (const entry of list) {
			const role = message.guild.roles.get(entry.role);
			if (!role) list.delete(entry);
			else lines.push(`${role.name.padEnd(25, ' ')} :: ${entry.emoji}`);
		}
		if (oldLength !== list.size) message.guild.settings.update('roles.reactions', [...list], { arrayAction: 'overwrite' });
		if (!lines.length) throw message.language.get('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		return message.sendMessage(util.codeBlock('asciicode', lines.join('\n')));
	}

	public async add(message: KlasaMessage, [role, reaction]: [Role, string]) {
		if (this._checkRoleReaction(message, reaction, role.id)) throw message.language.get('COMMAND_MANAGEROLEREACTION_EXISTS');
		const { errors } = await message.guild.settings.update('roles.reactions', { emoji: reaction, role: role.id }, { arrayAction: 'add' });
		if (errors.length) throw errors[0];
		if (message.guild.settings.get('roles.messageReaction'))
			await this._reactMessage(message.guild.settings.get('channels.roles') as string, message.guild.settings.get('roles.messageReaction') as string, reaction);
		return message.sendLocale('COMMAND_MANAGEROLEREACTION_ADD');
	}

	public async remove(message: KlasaMessage, [, reaction]: [Role, string]) {
		const list = message.guild.settings.get('roles.reactions') as GuildSettingsRolesReactions;
		if (!list.length) throw message.language.get('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		const entry = list.find((en) => en.emoji === reaction);
		if (!entry) throw message.language.get('COMMAND_MANAGEROLEREACTION_REMOVE_NOTEXISTS');
		const { errors } = await message.guild.settings.update('roles.reactions', entry, { arrayAction: 'remove' });
		if (errors.length) throw errors[0];
		return message.sendLocale('COMMAND_MANAGEROLEREACTION_REMOVE');
	}

	public async reset(message: KlasaMessage) {
		const list = message.guild.settings.get('roles.reactions') as GuildSettingsRolesReactions;
		if (!list.length) throw message.language.get('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		const { errors } = await message.guild.settings.reset('roles.reactions');
		if (errors.length) throw errors[0];
		return message.sendLocale('COMMAND_MANAGEROLEREACTION_RESET');
	}

	public _reactMessage(channelID: string, messageID: string, reaction: string) {
		// @ts-ignore
		return this.client.api.channels[channelID].messages[messageID].reactions[this.client.emojis.resolveIdentifier(reaction)]['@me'].put();
	}

	public _checkRoleReaction(message: KlasaMessage, reaction: string, roleID: string) {
		const list = message.guild.settings.get('roles.reactions') as GuildSettingsRolesReactions;
		if (list.length) for (const entry of list) if (entry.emoji === reaction || entry.role === roleID) return true;
		return false;
	}

}