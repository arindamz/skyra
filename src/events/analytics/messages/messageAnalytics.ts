import { AnalyticsEvent } from '#lib/structures/events/AnalyticsEvent';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.Message })
export default class extends AnalyticsEvent {
	public run(): void {
		this.client.analytics!.messageCount++;
	}
}