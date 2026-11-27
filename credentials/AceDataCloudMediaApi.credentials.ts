import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AceDataCloudMediaApi implements ICredentialType {
	name = 'aceDataCloudMediaApi';
	displayName = 'Ace Data Cloud Media API';
	documentationUrl = 'https://github.com/AceDataCloud/MediaN8N#credentials';
	icon = 'file:../nodes/AceDataCloud/acedatacloud.png' as const;
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Application token from Ace Data Cloud with access to the selected services',
		},
		{
			displayName: 'Service to Test',
			name: 'testService',
			type: 'options',
			default: 'suno',
			options: [
				{ name: 'MiniMax', value: 'minimax' },
				{ name: 'Seedance', value: 'seedance' },
				{ name: 'Seedream', value: 'seedream' },
				{ name: 'Suno', value: 'suno' },
			],
			description: 'Service used for the empty task lookup when testing this credential',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: { headers: { Authorization: '=Bearer {{$credentials.apiToken}}' } },
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.acedata.cloud',
			url: "={{$credentials.testService === 'minimax' ? '/minimax/tasks' : $credentials.testService === 'seedance' ? '/seedance/tasks' : $credentials.testService === 'seedream' ? '/seedream/tasks' : '/suno/tasks'}}",
			method: 'POST',
			body: { action: 'retrieve_batch', ids: [] },
		},
	};
}
