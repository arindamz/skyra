import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { api } from '@utils/Models/Api';
import { RESTGetAPIGuildMembersSearchResult } from 'discord-api-types/v6';
import { User } from 'discord.js';
import { Argument, KlasaMessage, Possible } from 'klasa';

const USER_REGEXP = Argument.regex.userOrMember;
const USER_TAG = /^\w{1,32}#\d{4}$/;

export default class extends Argument {
	public get user() {
		return this.store.get('user')!;
	}

	public async run(arg: string, possible: Possible, message: KlasaMessage): Promise<User> {
		if (!arg) throw await message.fetchLocale(LanguageKeys.Resolvers.InvalidUsername, { name: possible.name });
		if (!message.guild) return this.user.run(arg, possible, message);
		const resUser = await this.resolveUser(message, arg);
		if (resUser) return resUser;

		const result = await this.fetchMember(arg, message);
		if (result) return message.guild!.members.add(result).user;
		throw await message.fetchLocale(LanguageKeys.Resolvers.InvalidUsername, { name: possible.name });
	}

	private async resolveUser(message: KlasaMessage, query: string) {
		const id = USER_REGEXP.test(query) ? USER_REGEXP.exec(query)![1] : USER_TAG.test(query) ? this.client.users.getFromTag(query)?.id : null;
		if (!id) return null;

		try {
			return await this.client.users.fetch(id);
		} catch {
			throw await message.fetchLocale(LanguageKeys.Misc.UserNotExistent);
		}
	}

	private async fetchMember(query: string, message: KlasaMessage) {
		const [result] = (await api(this.client)
			.guilds(message.guild!.id)
			.members.search.get({ query: { query } })) as RESTGetAPIGuildMembersSearchResult;
		return result;
	}
}
