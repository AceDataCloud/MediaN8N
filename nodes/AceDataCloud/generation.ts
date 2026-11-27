import type { IDataObject } from 'n8n-workflow';

export function generation(
	resource: string,
	operation: string,
	prompt: string,
	options: IDataObject,
) {
	if (resource === 'suno' && operation === 'lyrics') {
		return { path: '/suno/lyrics', body: { prompt, model: options.lyricsModel ?? 'default' } };
	}
	if (operation !== 'generate') throw new Error('Select a supported operation');
	switch (resource) {
		case 'suno':
			return {
				path: '/suno/audios',
				body: {
					action: 'generate',
					async: true,
					custom: false,
					instrumental: options.instrumental ?? false,
					model: options.model ?? 'chirp-v5-5',
					prompt,
				},
			};
		case 'seedream':
			return {
				path: '/seedream/images',
				body: {
					async: true,
					model: 'doubao-seedream-5-0-pro-260628',
					prompt,
					size: options.size ?? '2K',
					response_format: options.responseFormat ?? 'url',
				},
			};
		case 'seedance':
		case 'minimax': {
			const seedance = resource === 'seedance';
			const duration = options.duration ?? (seedance ? 5 : 4);
			if (
				typeof duration !== 'number' ||
				!Number.isInteger(duration) ||
				duration < 4 ||
				duration > 15
			)
				throw new Error('Duration must be a whole number between 4 and 15 seconds');
			return {
				path: `/${resource}/videos`,
				body: {
					async: true,
					model: seedance ? 'doubao-seedance-2-0-260128' : 'MiniMax-H3',
					content: [{ type: 'text', text: prompt }],
					duration,
					ratio: '16:9',
					resolution: options.resolution ?? (seedance ? '720p' : '768P'),
				},
			};
		}
		default:
			throw new Error('Select a supported media resource');
	}
}
