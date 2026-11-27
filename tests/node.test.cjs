const { test } = require('node:test');
const assert = require('node:assert/strict');
const { AceDataCloud } = require('../dist/nodes/AceDataCloud/AceDataCloud.node.js');
const { AceDataCloudMediaApi } = require('../dist/credentials/AceDataCloudMediaApi.credentials.js');

function context(
	parameters,
	responses,
	{ count = 1, continueOnFail = false, typeVersion = 1 } = {},
) {
	const calls = [];
	let next = 0;
	return {
		calls,
		getInputData: () => Array.from({ length: count }, () => ({ json: {} })),
		getNode: () => ({
			name: 'Test Ace Data Cloud',
			type: '@acedatacloud/n8n-nodes-media.aceDataCloud',
			typeVersion,
			position: [0, 0],
			parameters: {},
		}),
		getNodeParameter: (name, index, fallback) => {
			const p = Array.isArray(parameters) ? parameters[index] : parameters;
			return name in p ? p[name] : fallback;
		},
		continueOnFail: () => continueOnFail,
		helpers: {
			httpRequestWithAuthentication: async (credential, request) => {
				calls.push({ credential, ...request });
				const response = responses[next++];
				if (response instanceof Error) throw response;
				return response;
			},
			returnJsonArray: (data) => data.map((json) => ({ json })),
			constructExecutionMetaData: (data, meta) =>
				data.map((item) => ({ ...item, pairedItem: meta.itemData })),
		},
	};
}

const node = new AceDataCloud();
const resources = node.description.properties.find((p) => p.name === 'resource');

test('registers a single node, credential and shared Task resource', () => {
	assert.deepEqual(
		resources.options.map((o) => o.value),
		['minimax', 'seedance', 'seedream', 'suno', 'task'],
	);
	assert.equal(resources.default, 'task');
	const credential = new AceDataCloudMediaApi();
	assert.deepEqual(node.description.credentials, [{ name: credential.name, required: true }]);
	assert.equal(credential.test.request.baseURL, 'https://api.acedata.cloud');
	assert.deepEqual(credential.test.request.body, { action: 'retrieve_batch', ids: [] });
	assert.equal(
		new Set(
			node.description.properties
				.filter((p) => p.name === 'options')
				.flatMap((p) => p.options.map((o) => o.name)),
		).has('lyricsModel'),
		true,
	);
});

const generations = [
	[
		'suno',
		'/suno/audios',
		{ model: 'chirp-v6', instrumental: true },
		{
			action: 'generate',
			async: true,
			custom: false,
			instrumental: true,
			model: 'chirp-v6',
			prompt: 'example',
		},
	],
	[
		'seedream',
		'/seedream/images',
		{ size: '1K', responseFormat: 'b64_json' },
		{
			async: true,
			model: 'doubao-seedream-5-0-pro-260628',
			prompt: 'example',
			size: '1K',
			response_format: 'b64_json',
		},
	],
	[
		'seedance',
		'/seedance/videos',
		{ duration: 6 },
		{
			async: true,
			model: 'doubao-seedance-2-0-260128',
			content: [{ type: 'text', text: 'example' }],
			duration: 6,
			ratio: '16:9',
			resolution: '720p',
		},
	],
	[
		'minimax',
		'/minimax/videos',
		{ resolution: '2K' },
		{
			async: true,
			model: 'MiniMax-H3',
			content: [{ type: 'text', text: 'example' }],
			duration: 4,
			ratio: '16:9',
			resolution: '2K',
		},
	],
];
for (const [resource, path, options, body] of generations) {
	test(`${resource} submits the documented payload and returns an unfinished task`, async () => {
		const ctx = context({ resource, operation: 'generate', prompt: 'example', options }, [
			{ task_id: 'abc' },
		]);
		const [[{ json, pairedItem }]] = await node.execute.call(ctx);
		assert.equal(ctx.calls.length, 1);
		assert.equal(ctx.calls[0].credential, 'aceDataCloudMediaApi');
		assert.equal(ctx.calls[0].url, `https://api.acedata.cloud${path}`);
		assert.deepEqual(ctx.calls[0].body, body);
		assert.deepEqual(
			[json.service, json.taskId, json.finished, pairedItem.item],
			[resource, 'abc', false, 0],
		);
	});
}

test('lyrics operation uses the selected lyrics model and returns the lyrics', async () => {
	const ctx = context(
		{
			resource: 'suno',
			operation: 'lyrics',
			prompt: 'example',
			options: { lyricsModel: 'remi-v1' },
		},
		[{ data: [{ text: 'a line' }] }],
	);
	const [[{ json }]] = await node.execute.call(ctx);
	assert.equal(ctx.calls[0].url, 'https://api.acedata.cloud/suno/lyrics');
	assert.equal(ctx.calls[0].body.model, 'remi-v1');
	assert.equal(json.data[0].text, 'a line');
});

const tasks = [
	[
		'suno',
		{
			id: 'abc',
			response: { success: true, data: [{ audio_url: 'https://example.com/song.mp3' }] },
		},
	],
	['seedream', { task_id: 'abc', success: true, data: [{ url: 'https://example.com/image.jpg' }] }],
	[
		'seedance',
		{
			id: 'abc',
			response: {
				success: true,
				data: { status: 'succeeded', video_url: 'https://example.com/video.mp4' },
			},
		},
	],
	[
		'minimax',
		{ task: { id: 'abc', status: 'succeeded', content: { url: 'https://example.com/video.mp4' } } },
	],
];
for (const [service, response] of tasks) {
	test(`Task/Get handles ${service}'s original response shape`, async () => {
		const ctx = context({ resource: 'task', operation: 'get', service, taskId: 'abc' }, [response]);
		const [[{ json }]] = await node.execute.call(ctx);
		assert.deepEqual(ctx.calls[0].body, { action: 'retrieve', id: 'abc' });
		assert.equal(ctx.calls[0].url, `https://api.acedata.cloud/${service}/tasks`);
		assert.equal(json.status, 'succeeded');
		assert.ok(json.data);
		assert.equal(json.successful, true);
	});
}

test('validates input and task identity before reporting a result', async () => {
	for (const [params, replies, message] of [
		[{ resource: 'task', operation: 'get', service: 'unknown', taskId: 'a' }, [], /supported/],
		[
			{ resource: 'task', operation: 'get', service: 'suno', taskId: 'a' },
			[{ id: 'b' }],
			/not found/,
		],
		[
			{ resource: 'seedance', operation: 'generate', prompt: 'example', options: { duration: 3 } },
			[],
			/Duration/,
		],
		[{ resource: 'seedream', operation: 'generate', prompt: 'example' }, [{}], /task ID/],
	]) {
		await assert.rejects(node.execute.call(context(params, replies)), message);
	}
});

test('does not retry generation on failure and preserves input item links', async () => {
	const ctx = context(
		{ resource: 'suno', operation: 'generate', prompt: 'example' },
		[new Error('mock rate limit'), { task_id: 'second' }],
		{ count: 2, continueOnFail: true },
	);
	const [rows] = await node.execute.call(ctx);
	assert.equal(ctx.calls.length, 2);
	assert.ok(rows[0].json.error);
	assert.deepEqual(
		rows.map((r) => r.pairedItem.item),
		[0, 1],
	);
});

test('task polling distinguishes pending and failed outcomes', async () => {
	for (const [response, status] of [
		[{ id: 'abc', success: true }, 'processing'],
		[{ id: 'abc', response: { error: { message: 'failure' } } }, 'failed'],
		[{ task: { id: 'abc', status: 'running' } }, 'processing'],
	]) {
		const [[{ json }]] = await node.execute.call(
			context({ resource: 'task', operation: 'get', service: 'minimax', taskId: 'abc' }, [
				response,
			]),
		);
		assert.equal(json.status, status);
		assert.equal(json.finished, status === 'failed');
	}
});
