// SPDX-License-Identifier: AGPL-3.0-or-later

import type {MessageDescriptor} from '@lingui/core';
import {msg} from '@lingui/core/macro';

interface MutualItemsDescriptorOptions {
	mutualCommunitiesCount: number;
	mutualGroupsCount: number;
	includeCount: boolean;
}

export const MUTUAL_COMMUNITIES_GROUPS_DESCRIPTOR = msg({
	message: 'Mutual places',
	comment:
		'Short label for a combined list of mutual group DMs and mutual communities. Translate "places" as the most accurate local word for shared communities and groups.',
});
export const MUTUAL_COMMUNITIES_GROUPS_COUNT_DESCRIPTOR = msg({
	message: 'Mutual places ({count})',
	comment:
		'Short tab or button label for a combined list of mutual group DMs and mutual communities. Preserve {count}; it is inserted by code. Translate "places" as the most accurate local word for shared communities and groups.',
});
export const MUTUAL_COMMUNITIES_DESCRIPTOR = msg({
	message: 'Mutual communities',
	comment: 'Short label for a list of mutual communities in the user profile modal.',
});
export const MUTUAL_COMMUNITIES_COUNT_DESCRIPTOR = msg({
	message: 'Mutual communities ({count})',
	comment:
		'Short tab or button label for a list of mutual communities in the user profile modal. Preserve {count}; it is inserted by code.',
});
export const MUTUAL_GROUPS_DESCRIPTOR = msg({
	message: 'Mutual groups',
	comment: 'Short label for a list of mutual group DMs in the user profile modal.',
});
export const MUTUAL_GROUPS_COUNT_DESCRIPTOR = msg({
	message: 'Mutual groups ({count})',
	comment:
		'Short tab or button label for a list of mutual group DMs in the user profile modal. Preserve {count}; it is inserted by code.',
});
export const MUTUAL_FRIENDS_COUNT_DESCRIPTOR = msg({
	message: 'Mutual friends ({count})',
	comment:
		'Short tab or button label for a list of mutual friends in the user profile modal. Preserve {count}; it is inserted by code.',
});
export const MUTUAL_FRIENDS_COMPACT_DESCRIPTOR = msg({
	message: '{count, plural, one {# Mutual Friend} other {# Mutual Friends}}',
	comment:
		'Compact label on the user profile card popout for mutual friends count. Preserve {count}; it is inserted by code.',
});
export const MUTUAL_COMMUNITIES_COMPACT_DESCRIPTOR = msg({
	message: '{count, plural, one {# Mutual Community} other {# Mutual Communities}}',
	comment:
		'Compact label on the user profile card popout for mutual communities count. Preserve {count}; it is inserted by code.',
});
export const MUTUAL_GROUPS_COMPACT_DESCRIPTOR = msg({
	message: '{count, plural, one {# Mutual Group} other {# Mutual Groups}}',
	comment:
		'Compact label on the user profile card popout for mutual groups count. Preserve {count}; it is inserted by code.',
});
export const MUTUAL_PLACES_COMPACT_DESCRIPTOR = msg({
	message: '{count, plural, one {# Mutual Place} other {# Mutual Places}}',
	comment:
		'Compact label on the user profile card popout for combined mutual groups and communities count. Preserve {count}; it is inserted by code.',
});
export const NO_MUTUAL_COMMUNITIES_FOUND_DESCRIPTOR = msg({
	message: 'No mutual communities found.',
	comment: 'Empty state in the user profile modal when no shared communities are available.',
});

export function getMutualItemsDescriptor({
	mutualCommunitiesCount,
	mutualGroupsCount,
	includeCount,
}: MutualItemsDescriptorOptions): MessageDescriptor {
	if (mutualCommunitiesCount > 0 && mutualGroupsCount > 0) {
		return includeCount ? MUTUAL_COMMUNITIES_GROUPS_COUNT_DESCRIPTOR : MUTUAL_COMMUNITIES_GROUPS_DESCRIPTOR;
	}
	if (mutualGroupsCount > 0) {
		return includeCount ? MUTUAL_GROUPS_COUNT_DESCRIPTOR : MUTUAL_GROUPS_DESCRIPTOR;
	}
	return includeCount ? MUTUAL_COMMUNITIES_COUNT_DESCRIPTOR : MUTUAL_COMMUNITIES_DESCRIPTOR;
}

export function getMutualItemsCompactDescriptor({
	mutualCommunitiesCount,
	mutualGroupsCount,
}: Omit<MutualItemsDescriptorOptions, 'includeCount'>): MessageDescriptor {
	if (mutualCommunitiesCount > 0 && mutualGroupsCount > 0) {
		return MUTUAL_PLACES_COMPACT_DESCRIPTOR;
	}
	if (mutualGroupsCount > 0) {
		return MUTUAL_GROUPS_COMPACT_DESCRIPTOR;
	}
	return MUTUAL_COMMUNITIES_COMPACT_DESCRIPTOR;
}
