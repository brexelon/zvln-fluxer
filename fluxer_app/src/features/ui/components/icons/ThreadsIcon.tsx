// SPDX-License-Identifier: AGPL-3.0-or-later

import type {IconProps} from '@phosphor-icons/react';
import React from 'react';

export const ThreadsIcon = React.forwardRef<SVGSVGElement, IconProps>(({size = 24, className, ...props}, ref) => (
	<svg
		ref={ref}
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		aria-hidden={true}
		data-flx="ui.icons.threads-icon.svg"
		{...props}
	>
		<path
			d="M5.5 17.5L16 7"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			data-flx="ui.icons.threads-icon.path"
		/>
		<path
			d="M8 20L18.5 9.5"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			data-flx="ui.icons.threads-icon.path--2"
		/>
		<path
			d="M11 22L21 12"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			data-flx="ui.icons.threads-icon.path--3"
		/>
	</svg>
));

ThreadsIcon.displayName = 'ThreadsIcon';
