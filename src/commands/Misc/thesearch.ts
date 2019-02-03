import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { join } from 'path';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { assetsFolder } from '../../Skyra';

export default class extends SkyraCommand {

	private template: Buffer = null;

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 30,
			description: (language) => language.get('COMMAND_THESEARCH_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_THESEARCH_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			runIn: ['text'],
			spam: true,
			usage: '<text:string>'
		});
	}

	public async run(message: KlasaMessage, [text]: [string]) {
		const attachment = await this.generate(text);
		return message.channel.send({ files: [{ attachment, name: 'TheSearch.png' }] });
	}

	public generate(text: string) {
		return new Canvas(700, 612)
			.addImage(this.template, 0, 0, 700, 612)
			.setTextAlign('center')
			.setTextFont('19px FamilyFriends')
			.createRectPath(61, 335, 156, 60)
			.clip()
			.addMultilineText(text.toUpperCase(), 139, 360, 156, 28)
			.toBufferAsync();
	}

	public async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/TheSearch.png'));
	}

}