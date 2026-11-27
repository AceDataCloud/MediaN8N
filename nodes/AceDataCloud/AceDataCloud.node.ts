import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import {
	failure,
	object,
	output,
	request,
	requiredText,
	submissionResult,
	taskResult,
} from './helpers';
import { generation } from './generation';
import { properties } from './properties';

const credential = 'aceDataCloudMediaApi';
const taskServices = ['minimax', 'seedance', 'seedream', 'suno'];

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
					const service = this.getNodeParameter('service', index) as string;
					if (operation !== 'get' || !taskServices.includes(service))
						throw new NodeOperationError(
							this.getNode(),
							'Select a supported task service and operation',
						);
					const id = requiredText(this.getNodeParameter('taskId', index), 'Task ID');
					const response = await request(this, credential, `/${service}/tasks`, {
						action: 'retrieve',
						id,
					});
					const record = response.task ? object(response.task) : response;
					if ((record.id ?? record.task_id) !== id)
						throw new NodeOperationError(
							this.getNode(),
							'The task was not found. Check the original service and task ID',
							{ itemIndex: index },
						);
					result.push(...output(this, [{ service, ...taskResult(record), task: record }], index));
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
