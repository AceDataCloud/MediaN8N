import { NodeOperationError } from 'n8n-workflow';
import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { object, request, requiredText, taskResult } from './helpers';

export const credential = 'aceDataCloudMediaApi';
const services = ['minimax', 'seedance', 'seedream', 'suno'];

export async function getTasks(
	context: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<IDataObject[]> {
	const service = context.getNodeParameter('service', index) as string;
	if (!['get', 'getMany'].includes(operation) || !services.includes(service))
		throw new NodeOperationError(
			context.getNode(),
			'Select a supported task service and operation',
			{ itemIndex: index },
		);
	const batch = operation === 'getMany';
	const ids = batch
		? requiredText(context.getNodeParameter('taskIds', index), 'Task IDs')
				.split(/[\n,]/)
				.map((id) => id.trim())
				.filter(Boolean)
		: [requiredText(context.getNodeParameter('taskId', index), 'Task ID')];
	if (!ids.length || ids.length > 50)
		throw new NodeOperationError(context.getNode(), 'Provide between 1 and 50 task IDs', {
			itemIndex: index,
		});
	const body = batch ? { action: 'retrieve_batch', ids } : { action: 'retrieve', id: ids[0] };
	const response = await request(context, credential, `/${service}/tasks`, body);
	const rows = batch ? response.items : [response.task ?? response];
	if (!Array.isArray(rows))
		throw new NodeOperationError(
			context.getNode(),
			'The service returned an unexpected task list',
			{ itemIndex: index },
		);
	return rows.map((row) => {
		const record = object(row);
		const taskId = record.id ?? record.task_id;
		if (typeof taskId !== 'string' || !ids.includes(taskId))
			throw new NodeOperationError(
				context.getNode(),
				'The task was not found. Check the original service and task ID',
				{ itemIndex: index },
			);
		return { service, ...taskResult(record), task: record };
	});
}
