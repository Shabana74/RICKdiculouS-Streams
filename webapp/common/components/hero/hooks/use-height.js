import { useMemo } from 'react';

export function useHeight(size) {
	return useMemo(() => {
		switch (size) {
			case 'large':
				return 500;
			case 'normal':
			default:
				return 300;
		}
	}, [size]);
}
