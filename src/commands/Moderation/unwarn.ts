import { GuildSettings, ModerationEntity } from '@lib/database';
import { HandledCommandContext, ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { GuildMessage } from '@lib/types';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Moderation } from '@utils/constants';
import { floatPromise, getImage } from '@utils/util';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['uw', 'unwarning'],
	description: (language) => language.get(LanguageKeys.Commands.Moderation.UnwarnDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.UnwarnExtended),
	usage: '<case:number> [reason:...string]'
})
export default class extends ModerationCommand {
	public async prehandle() {
		/* Do nothing */
	}

	public async run(message: GuildMessage, [caseID, reason]: [number, string]) {
		const [autoDelete, messageDisplay, reasonDisplay, language] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Messages.ModerationAutoDelete],
			settings[GuildSettings.Messages.ModerationMessageDisplay],
			settings[GuildSettings.Messages.ModerationReasonDisplay],
			settings.getLanguage()
		]);

		const modlog = await message.guild.moderation.fetch(caseID);
		if (!modlog || !modlog.isType(Moderation.TypeCodes.Warning))
			throw await message.fetchLocale(LanguageKeys.Commands.Moderation.GuildWarnNotFound);

		const user = await modlog.fetchUser();
		const unwarnLog = await this.handle(message, { target: user, reason, modlog, duration: null, preHandled: null });

		// If the server was configured to automatically delete messages, delete the command and return null.
		if (autoDelete) {
			if (message.deletable) floatPromise(this, message.nuke());
		}

		if (messageDisplay) {
			const originalReason = reasonDisplay ? unwarnLog.reason : null;
			return message.send(
				language.get(
					originalReason ? LanguageKeys.Commands.Moderation.ModerationOutputWithReason : LanguageKeys.Commands.Moderation.ModerationOutput,

					{
						count: 1,
						range: unwarnLog.caseID,
						users: `\`${user.tag}\``,
						reason: originalReason
					}
				)
			) as Promise<GuildMessage>;
		}

		return null;
	}

	public async handle(message: GuildMessage, context: HandledCommandContext<null> & { modlog: ModerationEntity }) {
		return message.guild.security.actions.unWarning(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message)
			},
			context.modlog.caseID,
			await this.getTargetDM(message, context.target)
		);
	}

	public async posthandle() {
		/* Do nothing */
	}
}
