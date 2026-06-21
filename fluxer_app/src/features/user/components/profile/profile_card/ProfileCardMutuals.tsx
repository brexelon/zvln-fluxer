// SPDX-License-Identifier: AGPL-3.0-or-later

import {GroupDMAvatar} from '@app/features/app/components/shared/GroupDMAvatar';
import * as ChannelUtils from '@app/features/channel/utils/ChannelUtils';
import {GuildIcon} from '@app/features/guild/components/popouts/GuildIcon';
import {UserContextMenu} from '@app/features/ui/action_menu/UserContextMenu';
import {AvatarStack} from '@app/features/ui/avatars/AvatarStack';
import * as ContextMenuCommands from '@app/features/ui/commands/ContextMenuCommands';
import {
	getMutualItemsDescriptor,
	MUTUAL_FRIENDS_COUNT_DESCRIPTOR,
} from '@app/features/user/components/modals/user_profile_modal/MutualItemsDescriptors';
import {
	getSortedMutualCommunityDisplayItems,
	getSortedMutualFriends,
	getSortedMutualGroupChannels,
	type MutualCommunityDisplayItem,
} from '@app/features/user/components/modals/user_profile_modal/MutualItemsUtils';
import type {ProfileTab} from '@app/features/user/components/modals/user_profile_modal/UserProfileModalShared';
import styles from '@app/features/user/components/profile/profile_card/ProfileCardMutuals.module.css';
import * as UserProfileCommands from '@app/features/user/commands/UserProfileCommands';
import type {Profile} from '@app/features/user/models/Profile';
import type {User} from '@app/features/user/models/User';
import {useLingui} from '@lingui/react/macro';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useCallback, useMemo} from 'react';

type MutualPlaceListItem =
	| {kind: 'group'; group: ReturnType<typeof getSortedMutualGroupChannels>[number]; sortName: string}
	| {kind: 'community'; community: MutualCommunityDisplayItem; sortName: string};

function getSortedMutualPlaceItems(
	sortedGroups: ReturnType<typeof getSortedMutualGroupChannels>,
	sortedCommunities: Array<MutualCommunityDisplayItem>,
): Array<MutualPlaceListItem> {
	return [
		...sortedGroups.map((group) => ({
			kind: 'group' as const,
			group,
			sortName: ChannelUtils.getDMDisplayName(group),
		})),
		...sortedCommunities.map((community) => ({
			kind: 'community' as const,
			community,
			sortName: community.nick ?? community.guild.name,
		})),
	].sort((left, right) => left.sortName.localeCompare(right.sortName, undefined, {sensitivity: 'base'}));
}

interface ProfileCardMutualsProps {
	profile: Profile;
	user: User;
	guildId?: string;
	onClose?: () => void;
}

export const ProfileCardMutuals: React.FC<ProfileCardMutualsProps> = observer(({profile, user, guildId, onClose}) => {
	const {i18n} = useLingui();
	const sortedFriends = useMemo(
		() => getSortedMutualFriends(profile.mutualFriends ?? [], profile.guildId ?? guildId),
		[profile.guildId, profile.mutualFriends, guildId],
	);
	const sortedCommunities = useMemo(
		() => getSortedMutualCommunityDisplayItems(profile.mutualGuilds ?? []),
		[profile.mutualGuilds],
	);
	const sortedGroups = useMemo(() => getSortedMutualGroupChannels(user.id), [user.id]);
	const sortedPlaces = useMemo(
		() => getSortedMutualPlaceItems(sortedGroups, sortedCommunities),
		[sortedCommunities, sortedGroups],
	);
	const mutualFriendsCount = sortedFriends.length;
	const mutualCommunitiesCount = sortedCommunities.length;
	const mutualGroupsCount = sortedGroups.length;
	const mutualPlacesCount = mutualCommunitiesCount + mutualGroupsCount;
	const hasMutualFriends = mutualFriendsCount > 0;
	const hasMutualPlaces = mutualPlacesCount > 0;
	const openProfileTab = useCallback(
		(tab: ProfileTab) => {
			onClose?.();
			UserProfileCommands.openUserProfile(user.id, profile.guildId ?? guildId, undefined, tab);
		},
		[guildId, onClose, profile.guildId, user.id],
	);
	const handleFriendContextMenu = useCallback(
		(event: React.MouseEvent, friend: User) => {
			event.preventDefault();
			event.stopPropagation();
			ContextMenuCommands.openFromEvent(event, ({onClose: closeMenu}) => (
				<UserContextMenu
					user={friend}
					guildId={profile.guildId ?? guildId}
					onClose={closeMenu}
					data-flx="user.profile.profile-card.profile-card-mutuals.friend-context-menu"
				/>
			));
		},
		[guildId, profile.guildId],
	);
	if (!hasMutualFriends && !hasMutualPlaces) {
		return null;
	}
	const placesCount =
		mutualCommunitiesCount > 0 && mutualGroupsCount > 0
			? mutualPlacesCount
			: mutualGroupsCount > 0
				? mutualGroupsCount
				: mutualCommunitiesCount;
	const placesLabel = i18n._(
		getMutualItemsDescriptor({
			mutualCommunitiesCount,
			mutualGroupsCount,
			includeCount: true,
		}),
		{count: placesCount},
	);
	const friendsLabel = i18n._(MUTUAL_FRIENDS_COUNT_DESCRIPTOR, {count: mutualFriendsCount});
	const showFriendAvatars = hasMutualFriends;
	const showPlaceIcons = hasMutualPlaces && !hasMutualFriends;
	const friendAvatarMaxVisible = hasMutualPlaces ? 1 : 3;
	const placeIconItems = sortedPlaces.slice(0, 3);
	return (
		<div className={styles.mutualsRow} data-flx="user.profile.profile-card.profile-card-mutuals.mutuals-row">
			{showFriendAvatars && (
				<AvatarStack
					className={styles.iconStack}
					size={20}
					maxVisible={friendAvatarMaxVisible}
					overlap={friendAvatarMaxVisible === 1 ? 0 : undefined}
					enableProfileModal={false}
					showTooltips={false}
					onUserContextMenu={handleFriendContextMenu}
					users={sortedFriends}
					guildId={profile.guildId ?? guildId}
					data-flx="user.profile.profile-card.profile-card-mutuals.friend-avatar-stack"
				/>
			)}
			{showPlaceIcons && (
				<AvatarStack
					className={styles.iconStack}
					size={20}
					maxVisible={3}
					overlap={placeIconItems.length === 1 ? 0 : undefined}
					enableProfileModal={false}
					showTooltips={false}
				>
					{placeIconItems.map((place) =>
						place.kind === 'group' ? (
							<div key={place.group.id} className={styles.guildIconWrapper}>
								<GroupDMAvatar channel={place.group} size={20} />
							</div>
						) : (
							<div key={place.community.guild.id} className={styles.guildIconWrapper}>
								<GuildIcon
									id={place.community.guild.id}
									name={place.community.guild.name}
									icon={place.community.guild.icon}
									className={styles.guildIcon}
									sizePx={20}
								/>
							</div>
						),
					)}
				</AvatarStack>
			)}
			<div className={styles.mutualsText} data-flx="user.profile.profile-card.profile-card-mutuals.mutuals-text">
				{hasMutualFriends && (
					<button
						type="button"
						className={styles.mutualLink}
						onClick={() => openProfileTab('mutual_friends')}
						data-flx="user.profile.profile-card.profile-card-mutuals.mutual-friends-link"
					>
						<span className={styles.mutualsLabel}>{friendsLabel}</span>
					</button>
				)}
				{hasMutualFriends && hasMutualPlaces && (
					<span className={styles.mutualsSeparator} aria-hidden="true">
						•
					</span>
				)}
				{hasMutualPlaces && (
					<button
						type="button"
						className={styles.mutualLink}
						onClick={() => openProfileTab('mutual_communities_groups')}
						data-flx="user.profile.profile-card.profile-card-mutuals.mutual-communities-link"
					>
						<span className={styles.mutualsPlacesLabel}>{placesLabel}</span>
					</button>
				)}
			</div>
		</div>
	);
});
