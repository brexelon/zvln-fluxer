// SPDX-License-Identifier: AGPL-3.0-or-later

import styles from '@app/features/channel/components/popouts/ThreadsPopout.module.css';
import type {Channel} from '@app/features/channel/models/Channel';
import Threads, {type Thread} from '@app/features/channel/state/Threads';
import {ThreadsIcon} from '@app/features/ui/components/icons/ThreadsIcon';
import {msg} from '@lingui/core/macro';
import {useLingui} from '@lingui/react/macro';
import {MagnifyingGlassIcon} from '@phosphor-icons/react';
import {observer} from 'mobx-react-lite';
import {useCallback, useMemo, useRef, useState} from 'react';

const THREADS_DESCRIPTOR = msg({
	message: 'Threads',
	comment: 'Title of the threads popout. Keep it concise.',
});
const SEARCH_FOR_THREAD_NAME_DESCRIPTOR = msg({
	message: 'Search for Thread Name',
	comment: 'Placeholder for the thread search input. Keep it concise.',
});
const CREATE_DESCRIPTOR = msg({
	message: 'Create',
	comment: 'Label for the button that creates a new thread. Keep it concise.',
});
const CREATE_THREAD_DESCRIPTOR = msg({
	message: 'Create Thread',
	comment: 'Label for the button that creates a new thread from the empty state. Keep it concise.',
});
const NO_THREADS_TITLE_DESCRIPTOR = msg({
	message: 'There are no threads.',
	comment: 'Heading shown when a channel has no threads. Keep it concise.',
});
const NO_THREADS_DESCRIPTION_DESCRIPTOR = msg({
	message: 'Stay focused on a conversation with a thread - a temporary text channel.',
	comment: 'Description shown when a channel has no threads.',
});
const NO_RECENT_MESSAGES_DESCRIPTOR = msg({
	message: 'No recent messages',
	comment: 'Subtitle for a thread that has no messages yet. Keep it concise.',
});

function formatRelativeTime(timestamp: number): string {
	const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
	if (seconds < 60) {
		return 'just now';
	}
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) {
		return `${minutes}m ago`;
	}
	const hours = Math.round(minutes / 60);
	if (hours < 24) {
		return `${hours}h ago`;
	}
	const days = Math.round(hours / 24);
	if (days <= 30) {
		return `${days}d ago`;
	}
	return '>30d ago';
}

const ThreadListItem = observer(({thread}: {thread: Thread}) => {
	const {i18n} = useLingui();
	const preview = thread.lastMessagePreview ?? i18n._(NO_RECENT_MESSAGES_DESCRIPTOR);
	return (
		<button
			type="button"
			className={styles.threadItem}
			data-flx="channel.threads-popout.thread-item"
		>
			<div className={styles.threadInfo} data-flx="channel.threads-popout.thread-info">
				<span className={styles.threadName} data-flx="channel.threads-popout.thread-name">
					{thread.name}
				</span>
				<span className={styles.threadMeta} data-flx="channel.threads-popout.thread-meta">
					{preview} • {formatRelativeTime(thread.createdAt)}
				</span>
			</div>
		</button>
	);
});

export const ThreadsPopout = observer(({channel}: {channel: Channel; onClose?: () => void}) => {
	const {i18n} = useLingui();
	const [query, setQuery] = useState('');
	const searchInputRef = useRef<HTMLInputElement>(null);
	const threads = Threads.getThreads(channel.id);
	const filteredThreads = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		if (!normalized) {
			return threads;
		}
		return threads.filter((thread) => thread.name.toLowerCase().includes(normalized));
	}, [threads, query]);
	const handleCreate = useCallback(() => {
		const name = query.trim();
		if (!name) {
			searchInputRef.current?.focus();
			return;
		}
		Threads.createThread(channel.id, name);
		setQuery('');
	}, [channel.id, query]);
	const hasThreads = filteredThreads.length > 0;
	return (
		<div className={styles.container} data-flx="channel.threads-popout.container">
			<div className={styles.header} data-flx="channel.threads-popout.header">
				<div className={styles.titleGroup} data-flx="channel.threads-popout.title-group">
					<ThreadsIcon className={styles.iconLarge} data-flx="channel.threads-popout.icon-large" />
					<h1 className={styles.title} data-flx="channel.threads-popout.title">
						{i18n._(THREADS_DESCRIPTOR)}
					</h1>
				</div>
				<div className={styles.searchWrapper} data-flx="channel.threads-popout.search-wrapper">
					<MagnifyingGlassIcon className={styles.searchIcon} data-flx="channel.threads-popout.search-icon" />
					<input
						ref={searchInputRef}
						type="text"
						className={styles.searchInput}
						placeholder={i18n._(SEARCH_FOR_THREAD_NAME_DESCRIPTOR)}
						aria-label={i18n._(SEARCH_FOR_THREAD_NAME_DESCRIPTOR)}
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								event.preventDefault();
								handleCreate();
							}
						}}
						data-flx="channel.threads-popout.search-input"
					/>
				</div>
				<button
					type="button"
					className={styles.createButton}
					onClick={handleCreate}
					data-flx="channel.threads-popout.create-button"
				>
					{i18n._(CREATE_DESCRIPTOR)}
				</button>
			</div>
			{hasThreads ? (
				<div className={styles.body} data-flx="channel.threads-popout.body">
					{filteredThreads.map((thread) => (
						<ThreadListItem
							key={thread.id}
							thread={thread}
							data-flx="channel.threads-popout.thread-list-item"
						/>
					))}
				</div>
			) : (
				<div className={styles.emptyState} data-flx="channel.threads-popout.empty-state">
					<div className={styles.emptyIconWrapper} data-flx="channel.threads-popout.empty-icon-wrapper">
						<ThreadsIcon className={styles.emptyIcon} data-flx="channel.threads-popout.empty-icon" />
					</div>
					<div className={styles.emptyTitle} data-flx="channel.threads-popout.empty-title">
						{i18n._(NO_THREADS_TITLE_DESCRIPTOR)}
					</div>
					<div className={styles.emptyDescription} data-flx="channel.threads-popout.empty-description">
						{i18n._(NO_THREADS_DESCRIPTION_DESCRIPTOR)}
					</div>
					<button
						type="button"
						className={styles.emptyCreateButton}
						onClick={handleCreate}
						data-flx="channel.threads-popout.empty-create-button"
					>
						{i18n._(CREATE_THREAD_DESCRIPTOR)}
					</button>
				</div>
			)}
		</div>
	);
});
