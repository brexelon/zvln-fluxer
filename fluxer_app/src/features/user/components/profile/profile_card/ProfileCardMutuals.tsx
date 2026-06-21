// SPDX-License-Identifier: AGPL-3.0-or-later

import {GroupDMAvatar} from '@app/features/app/components/shared/GroupDMAvatar';
import * as ChannelUtils from '@app/features/channel/utils/ChannelUtils';
import {GuildIcon} from '@app/features/guild/components/popouts/GuildIcon';
import {MenuGroup} from '@app/features/ui/action_menu/MenuGroup';
import {MenuItem} from '@app/features/ui/action_menu/MenuItem';
import {UserContextMenu} from '@app/features/ui/action_menu/UserContextMenu';
import {AvatarStack} from '@app/features/ui/avatars/AvatarStack';
import * as ContextMenuCommands from '@app/features/ui/commands/ContextMenuCommands';
import {StatusAwareAvatar} from '@app/features/ui/components/StatusAwareAvatar';
import {getMutualItemsDescriptor} from '@app/features/user/components/modals/user_profile_modal/MutualItemsDescriptors';
import {
	getSortedMutualCommunityDisplayItems,
	getSortedMutualFriends,
	getSortedMutualGroupChannels,
	type MutualCommunityDisplayItem,
} from '@app/features/user/components/modals/user_profile_modal/MutualItemsUtils';
import styles from '@app/features/user/components/profile/profile_card/ProfileCardMutuals.module.css';
import type {Profile} from '@app/features/user/models/Profile';
import type {User} from '@app/features/user/models/User';
import * as UserProfileCommands from '@app/features/user/commands/UserProfileCommands';
import * as NicknameUtils from '@app/features/user/utils/NicknameUtils';
import * as NavigationCommands from '@app/features/navigation/commands/NavigationCommands';
import SelectedChannel from '@app/features/navigation/state/SelectedChannel';
import {focusChannelTextareaAfterNavigation} from '@app/features/messaging/utils/ChannelTextareaFocusUtils';
import {ME} from '@fluxer/constants/src/AppConstants';
import {msg} from '@lingui/core/macro';
import {useLingui} from '@lingui/react/macro';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useCallback, useMemo} from 'react';

const MUTUAL_FRIENDS_COMPACT_DESCRIPTOR = msg({
	message: '{count, plural, one {# Mutual Friend} other {# Mutual Friends}}',
	comment: 'Compact profile card label for the number of mutual friends. Preserve {count}.',
});

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
	const handleFriendClick = useCallback(
		(friendId: string) => {
			onClose?.();
			UserProfileCommands.openUserProfile(friendId, profile.guildId ?? guildId);
		},
		[guildId, onClose, profile.guildId],
	);
	const handleGuildClick = useCallback(
		(guildIdToOpen: string) => {
			onClose?.();
			const selectedChannel = SelectedChannel.selectedChannelIds.get(guildIdToOpen);
			NavigationCommands.selectGuild(guildIdToOpen, selectedChannel);
		},
		[onClose],
	);
	const handleGroupClick = useCallback(
		(groupId: string) => {
			onClose?.();
			NavigationCommands.selectChannel(ME, groupId);
			focusChannelTextareaAfterNavigation(groupId);
		},
		[onClose],
	);
	const openMutualsMenu = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			ContextMenuCommands.openFromEvent(event, ({onClose: closeMenu}) => (
				<>
					{hasMutualFriends && (
						<MenuGroup data-flx="user.profile.profile-card.profile-card-mutuals.menu-group.friends">
							{sortedFriends.map((friend) => (
								<MenuItem
									key={friend.id}
									icon={
										<div className={styles.menuIconFrame}>
											<StatusAwareAvatar size={24} user={friend} />
										</div>
									}
									onClick={() => {
										handleFriendClick(friend.id);
										closeMenu();
									}}
									data-flx="user.profile.profile-card.profile-card-mutuals.menu-item.friend"
								>
									{NicknameUtils.getNickname(friend, profile.guildId ?? guildId)}
								</MenuItem>
							))}
						</MenuGroup>
					)}
					{hasMutualPlaces && (
						<MenuGroup data-flx="user.profile.profile-card.profile-card-mutuals.menu-group.places">
							{sortedPlaces.map((place) =>
								place.kind === 'group' ? (
									<MenuItem
										key={place.group.id}
										icon={
											<div className={styles.menuIconFrame}>
												<GroupDMAvatar channel={place.group} size={24} />
											</div>
										}
										onClick={() => {
											handleGroupClick(place.group.id);
											closeMenu();
										}}
										data-flx="user.profile.profile-card.profile-card-mutuals.menu-item.group"
									>
										{place.sortName}
									</MenuItem>
								) : (
									<MenuItem
										key={place.community.guild.id}
										icon={
											<div className={styles.menuIconFrame}>
												<GuildIcon
													id={place.community.guild.id}
													name={place.community.guild.name}
													icon={place.community.guild.icon}
													className={styles.menuGuildIcon}
													sizePx={24}
												/>
											</div>
										}
										onClick={() => {
											handleGuildClick(place.community.guild.id);
											closeMenu();
										}}
										data-flx="user.profile.profile-card.profile-card-mutuals.menu-item.community"
									>
										{place.sortName}
									</MenuItem>
								),
							)}
						</MenuGroup>
					)}
				</>
			));
		},
		[
			guildId,
			handleFriendClick,
			handleGroupClick,
			handleGuildClick,
			hasMutualFriends,
			hasMutualPlaces,
			profile.guildId,
			sortedCommunities,
			sortedFriends,
			sortedPlaces,
		],
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
	const placesLabel = i18n._(
		getMutualItemsDescriptor({
			mutualCommunitiesCount,
			mutualGroupsCount,
			includeCount: true,
		}),
		{count: mutualPlacesCount},
	);
	const showFriendAvatars = hasMutualFriends;
	const showPlaceIcons = hasMutualPlaces && !hasMutualFriends;
	const friendAvatarMaxVisible = hasMutualPlaces ? 1 : 3;
	const placeIconItems = sortedPlaces.slice(0, 3);
	return (
		<div className={styles.mutualsRow} data-flx="user.profile.profile-card.profile-card-mutuals.mutuals-row">
			<button
				type="button"
				className={styles.mutualsButton}
				onClick={openMutualsMenu}
				data-flx="user.profile.profile-card.profile-card-mutuals.mutuals-button"
			>
				{showFriendAvatars && (
					<AvatarStack
						className={styles.iconStack}
						size={20}
						maxVisible={friendAvatarMaxVisible}
						enableProfileModal={false}
						showTooltips={false}
						onUserContextMenu={handleFriendContextMenu}
						users={sortedFriends}
						guildId={profile.guildId ?? guildId}
						data-flx="user.profile.profile-card.profile-card-mutuals.friend-avatar-stack"
					/>
				)}
				{showPlaceIcons && (
					<AvatarStack className={styles.iconStack} size={20} maxVisible={3} enableProfileModal={false} showTooltips={false}>
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
				<span className={styles.mutualsText} data-flx="user.profile.profile-card.profile-card-mutuals.mutuals-text">
					{hasMutualFriends && i18n._(MUTUAL_FRIENDS_COMPACT_DESCRIPTOR, {count: mutualFriendsCount})}
					{hasMutualFriends && hasMutualPlaces && (
						<span className={styles.mutualsSeparator} aria-hidden="true">
							•
						</span>
					)}
					{hasMutualPlaces && placesLabel}
				</span>
			</button>
		</div>
	);
});
