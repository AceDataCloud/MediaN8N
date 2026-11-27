# Ace Data Cloud for n8n

Generate music with Suno, images with Seedream, and videos with Seedance or MiniMax. One Ace Data Cloud node and credential type cover all four services. The Task resource looks up a task that was created by any of them.

## Installation

In self-hosted n8n, open **Settings → Community nodes → Install**, enter `@acedatacloud/n8n-nodes-media`, and install. Add **Ace Data Cloud** after a trigger. The node can also be added as an AI Agent tool. n8n Cloud availability depends on n8n verification. [n8n community node installation](https://docs.n8n.io/integrations/community-nodes/installation-and-management/)

## Credentials

Register with Ace Data Cloud, enable the services you intend to use, and create an application token in the console. For a workflow spanning multiple services, select a token with access to those services. Paste it into the **Ace Data Cloud Media API** credential and select an enabled **Service to Test**. Testing sends an empty task lookup. A token limited to one service works with that service. [Ace Data Cloud applications](https://platform.acedata.cloud/console/applications)

## Use the node

| Resource | Operation | Inputs and output |
| --- | --- | --- |
| Suno Audio | Generate Music | Supply a prompt. Options include the model and instrumental mode. Returns `service` and `taskId`. |
| Suno Audio | Write Lyrics | Supply a prompt. The lyrics model is optional. Returns the API lyrics response and its service. |
| Seedream Image | Generate Image | Supply a prompt for Seedream 5.0 Pro. Options include output size and response format. Returns `service` and `taskId`. |
| Seedance Video | Generate Video | Supply a prompt for Seedance 2.0. Duration and resolution are optional. Returns `service` and `taskId`. |
| MiniMax Video | Generate Video | Supply a prompt for MiniMax H3. Duration and resolution are optional. Returns `service` and `taskId`. |
| Task | Get | Choose the original service and enter its task ID. Returns status, result data, and the original task record. |

Creation processes each input item separately and can incur a charge. To continue after a timeout, query the existing task ID. In a polling workflow use a Wait node between lookups and a time limit. Use returned media when `successful` is true. [Service pricing](https://platform.acedata.cloud/models)

Import [Get an existing media task](examples/get-task.json) to try a lookup. Choose your credential, service and an existing task ID before running.

## Existing workflows

The existing Suno, Seedream, Seedance and MiniMax packages keep their original node and credential identifiers. You can install this package alongside them. To migrate a workflow, duplicate it, add **Ace Data Cloud** next to the original node, select the matching resource and operation, and create an **Ace Data Cloud Media API** credential. Test with **Task → Get** and an ID you already have, then reconnect downstream expressions to `taskId`, `data` or `task`. Keep the old node for service-specific actions outside the table above.

## Development

Use Node.js 24 and pnpm. Run `pnpm install --frozen-lockfile`, `pnpm run build`, `pnpm run lint`, and `pnpm test`. Tests use controlled API responses. The package uses n8n's HTTP and credential helpers and has no additional runtime dependencies. The icon is the Ace Data Cloud platform mark.

MIT. Maintained by Ace Data Cloud. [Report an integration issue](https://github.com/AceDataCloud/MediaN8N/issues)
