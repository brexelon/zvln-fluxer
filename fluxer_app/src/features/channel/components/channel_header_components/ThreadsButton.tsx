// SPDX-License-Identifier: AGPL-3.0-or-later

import {ChannelHeaderIcon} from '@app/features/channel/components/channel_header_components/ChannelHeaderIcon';
import {ThreadsPopout} from '@app/features/channel/components/popouts/ThreadsPopout';
import type {Channel} from '@app/features/channel/models/Channel';
import {ThreadsIcon} from '@app/features/ui/components/icons/ThreadsIcon';
import {usePopout} from '@app/features/ui/hooks/usePopout';
import {Popout} from '@app/features/ui/popover/PopoverPopout';
import {msg} from '@lingui/core/macro';
import {useLingui} from '@lingui/react/macro';
import {observer} from 'mobx-react-lite';

const THREADS_DESCRIPTOR = msg({
	message: 'Threads',
	comment: 'Button label for opening the threads menu in the channel header. Keep it concise.',
});

interface ThreadsButtonProps {
	channel: Channel;
}

export const ThreadsButton = observer(({channel}: ThreadsButtonProps) => {
	const {i18n} = useLingui();
	const {isOpen, openProps} = usePopout('channel-threads');
	return (
		<Popout
			data-flx="channel.channel-header-components.threads-button.popout"
			{...openProps}
			render={({onClose}) => (
				<ThreadsPopout
					channel={channel}
					onClose={onClose}
					data-flx="channel.channel-header-components.threads-button.threads-popout"
				/>
			)}
			position="bottom-end"
			subscribeTo="THREADS_OPEN"
		>
			<ChannelHeaderIcon
				icon={ThreadsIcon}
				label={i18n._(THREADS_DESCRIPTOR)}
				isSelected={isOpen}
				aria-haspopup={true}
				aria-expanded={isOpen}
				data-flx="channel.channel-header-components.threads-button.channel-header-icon"
			/>
		</Popout>
	);
});
