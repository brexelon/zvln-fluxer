// SPDX-License-Identifier: AGPL-3.0-or-later

import {Logger} from '@app/features/platform/utils/AppLogger';
import {makeAutoObservable} from 'mobx';

const logger = new Logger('Threads');

export interface Thread {
	readonly id: string;
	readonly channelId: string;
	name: string;
	lastMessagePreview: string | null;
	createdAt: number;
}

let nextThreadId = 1;

/**
 * Client-side store for channel threads (temporary text channels).
 *
 * Threads are keyed by their parent channel id. This store currently holds
 * threads locally so the Threads UI can be exercised; once the backend exposes
 * thread channels, gateway events should populate and mutate this store in
 * place of the local {@link createThread} helper.
 */
class Threads {
	private threadsByChannel = new Map<string, Array<Thread>>();

	constructor() {
		makeAutoObservable(this, {}, {autoBind: true});
	}

	getThreads(channelId: string): Array<Thread> {
		return this.threadsByChannel.get(channelId) ?? [];
	}

	setThreads(channelId: string, threads: Array<Thread>): void {
		this.threadsByChannel.set(channelId, threads);
	}

	createThread(channelId: string, name: string): Thread | null {
		const trimmed = name.trim();
		if (!trimmed) {
			return null;
		}
		const thread: Thread = {
			id: `local-thread-${nextThreadId++}`,
			channelId,
			name: trimmed,
			lastMessagePreview: null,
			createdAt: Date.now(),
		};
		const existing = this.threadsByChannel.get(channelId) ?? [];
		this.threadsByChannel.set(channelId, [thread, ...existing]);
		logger.debug(`Created thread "${trimmed}" in channel ${channelId}`);
		return thread;
	}

	removeThread(channelId: string, threadId: string): void {
		const existing = this.threadsByChannel.get(channelId);
		if (!existing) {
			return;
		}
		this.threadsByChannel.set(
			channelId,
			existing.filter((thread) => thread.id !== threadId),
		);
	}
}

export default new Threads();
