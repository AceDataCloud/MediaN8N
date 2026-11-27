import type { INodeProperties } from 'n8n-workflow';

export const properties: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'MiniMax Video',
				value: 'minimax',
			},
			{
				name: 'Seedance Video',
				value: 'seedance',
			},
			{
				name: 'Seedream Image',
				value: 'seedream',
			},
			{
				name: 'Suno Audio',
				value: 'suno',
			},
			{
				name: 'Task',
				value: 'task',
			},
		],
		default: 'task',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'generate',
		displayOptions: {
			show: {
				resource: ['suno'],
			},
		},
		options: [
			{
				name: 'Generate Music',
				value: 'generate',
				action: 'Generate music',
			},
			{
				name: 'Write Lyrics',
				value: 'lyrics',
				action: 'Write lyrics',
			},
		],
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'generate',
		displayOptions: {
			show: {
				resource: ['seedream'],
			},
		},
		options: [
			{
				name: 'Generate Image',
				value: 'generate',
				action: 'Generate an image',
			},
		],
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'generate',
		displayOptions: {
			show: {
				resource: ['seedance'],
			},
		},
		options: [
			{
				name: 'Generate Video',
				value: 'generate',
				action: 'Generate a video',
			},
		],
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'generate',
		displayOptions: {
			show: {
				resource: ['minimax'],
			},
		},
		options: [
			{
				name: 'Generate Video',
				value: 'generate',
				action: 'Generate a video with mini max',
			},
		],
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'get',
		displayOptions: {
			show: {
				resource: ['task'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a media task',
			},
			{ name: 'Get Many', value: 'getMany', action: 'Get many media tasks' },
		],
	},
	{
		displayName: 'Service',
		name: 'service',
		type: 'options',
		default: 'suno',
		options: [
			{
				name: 'MiniMax Video',
				value: 'minimax',
			},
			{
				name: 'Seedance Video',
				value: 'seedance',
			},
			{
				name: 'Seedream Image',
				value: 'seedream',
			},
			{
				name: 'Suno Audio',
				value: 'suno',
			},
		],
		displayOptions: {
			show: {
				resource: ['task'],
			},
		},
		description: 'The service that created the task',
	},
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['get'],
			},
		},
		description: 'ID returned by the original creation request',
	},
	{
		displayName: 'Task IDs',
		name: 'taskIds',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		required: true,
		displayOptions: { show: { resource: ['task'], operation: ['getMany'] } },
		description: 'Up to 50 task IDs from the same service, separated by commas or new lines',
	},
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['minimax', 'seedance', 'seedream', 'suno'],
			},
		},
		description: 'Describe the media or lyrics to generate',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['suno'],
				operation: ['generate'],
			},
		},
		options: [
			{
				displayName: 'Instrumental',
				name: 'instrumental',
				type: 'boolean',
				default: false,
				description: 'Whether to generate music without vocals',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				default: 'chirp-v5-5',
				options: [
					{
						name: 'chirp-v5',
						value: 'chirp-v5',
					},
					{
						name: 'chirp-v5-5',
						value: 'chirp-v5-5',
					},
					{
						name: 'chirp-v6',
						value: 'chirp-v6',
					},
					{
						name: 'chirp-v6-mini',
						value: 'chirp-v6-mini',
					},
					{
						name: 'chirp-v6-wild',
						value: 'chirp-v6-wild',
					},
				],
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['suno'],
				operation: ['lyrics'],
			},
		},
		options: [
			{
				displayName: 'Lyrics Model',
				name: 'lyricsModel',
				type: 'options',
				default: 'default',
				options: [
					{
						name: 'Default',
						value: 'default',
					},
					{
						name: 'remi-v1',
						value: 'remi-v1',
					},
				],
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['seedream'],
				operation: ['generate'],
			},
		},
		options: [
			{
				displayName: 'Response Format',
				name: 'responseFormat',
				type: 'options',
				default: 'url',
				options: [
					{
						name: 'Url',
						value: 'url',
					},
					{
						name: 'B64_json',
						value: 'b64_json',
					},
				],
			},
			{
				displayName: 'Size',
				name: 'size',
				type: 'options',
				default: '2K',
				options: [
					{
						name: '2K',
						value: '2K',
					},
					{
						name: '1K',
						value: '1K',
					},
					{
						name: '1.5K',
						value: '1.5K',
					},
				],
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['seedance'],
				operation: ['generate'],
			},
		},
		options: [
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'number',
				typeOptions: {
					minValue: 4,
					maxValue: 15,
				},
				default: 5,
				description: 'Length of the video in seconds',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				default: '720p',
				options: [
					{
						name: '720p',
						value: '720p',
					},
					{
						name: '480p',
						value: '480p',
					},
					{
						name: '1080p',
						value: '1080p',
					},
				],
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['minimax'],
				operation: ['generate'],
			},
		},
		options: [
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'number',
				typeOptions: {
					minValue: 4,
					maxValue: 15,
				},
				default: 4,
				description: 'Length of the video in seconds',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				default: '768P',
				options: [
					{
						name: '768P',
						value: '768P',
					},
					{
						name: '2K',
						value: '2K',
					},
				],
			},
		],
	},
];
