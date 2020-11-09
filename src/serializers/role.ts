import { Serializer, SerializerUpdateContext } from '@lib/database';
import { Awaited } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<string> {
	public parse(value: string, context: SerializerUpdateContext): Awaited<string> {
		const id = UserSerializer.regex.role.exec(value);
		const role = id ? context.entity.guild.roles.cache.get(id[0]) : context.entity.guild.roles.cache.find((r) => r.name === value);
		if (role) return role.id;
		throw context.language.get('resolverInvalidRole', { name: context.entry.name });
	}

	public isValid(value: string, context: SerializerUpdateContext): Awaited<boolean> {
		if (context.entity.guild.roles.cache.has(value)) return true;
		throw context.language.get('resolverInvalidRole', { name: context.entry.name });
	}

	public stringify(value: string, context: SerializerUpdateContext) {
		return context.entity.guild.roles.cache.get(value)?.name ?? value;
	}
}