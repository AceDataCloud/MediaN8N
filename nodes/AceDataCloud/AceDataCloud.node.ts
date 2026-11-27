import { NodeConnectionTypes } from 'n8n-workflow';
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { failure, object, output, request, requiredText, submissionResult } from './helpers';
import { generation } from './generation';
import { properties } from './properties';

import { credential, getTasks } from './tasks';

export class AceDataCloud implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ace Data Cloud',
		name: 'aceDataCloud',
		icon: { light: 'file:acedatacloud.png', dark: 'file:acedatacloud.dark.png' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Generate music, images and videos and retrieve existing media tasks',
		defaults: { name: 'Ace Data Cloud' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: credential, required: true }],
		properties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const result: INodeExecutionData[] = [];
		for (let index = 0; index < items.length; index++) {
			try {
				const resource = this.getNodeParameter('resource', index) as string;
				const operation = this.getNodeParameter('operation', index) as string;
				if (resource === 'task') {
					result.push(...output(this, await getTasks(this, index, operation), index));
					continue;
				}
				const prompt = requiredText(this.getNodeParameter('prompt', index), 'Prompt');
				const options = object(this.getNodeParameter('options', index, {}));
				const { path, body } = generation(resource, operation, prompt, options);
				const response = await request(this, credential, path, body);
				const data = operation === 'lyrics' ? response : submissionResult(response);
				result.push(...output(this, [{ service: resource, ...data }], index));
			} catch (error) {
				result.push(failure(this, error, index));
			}
		}
		return [result];
	}
}
