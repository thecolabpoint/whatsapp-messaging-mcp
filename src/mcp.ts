import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { logger, maskRecipient } from './logging/logger.js';
import { z } from 'zod';
import { adaClient } from './lib/adaClient.js';
import { env } from './config/env.js';

export function createMcpServer(): McpServer {
    const mcp = new McpServer({
        name: 'messaging-mcp-server',
        version: '0.1.0',
    });

    const registerTool = <Schema extends z.ZodObject<any>>(
        name: string,
        schema: Schema,
        handler: (args: z.infer<Schema>) => Promise<unknown> | unknown,
    ): void => {
        mcp.tool(name, schema.shape, handler as any);
    };

    // send_text
    registerTool(
        'send_text',
        z.object({
            to: z.string().min(5).describe('Recipient phone number (MSISDN), e.g. 628116823073'),
            text: z.string().min(1).describe('Plain text message body'),
        }),
        async (args) => {
            logger.info({ tool: 'send_text', to: maskRecipient(args.to) }, 'Tool invoked');
            const res = await adaClient.sendText({
                to: args.to,
                text: args.text,
            });
            logger.info(
                {
                    tool: 'send_text',
                    to: maskRecipient(args.to),
                    status: (res as any).status,
                    messageId: (res as any).messageId,
                },
                'Tool completed',
            );
            return { content: [{ type: 'text', text: JSON.stringify(res) }] } as any;
        },
    );

    // send_list
    registerTool(
        'send_list',
        z.object({
            to: z.string().min(5).describe('Recipient phone number (MSISDN)'),
            text: z.string().min(1).max(1024).describe('Intro text shown above the list'),
            listTitle: z.string().min(1).max(20).describe('Title displayed on the selection sheet'),
            listData: z
                .array(
                    z
                        .object({
                            title: z.string().min(1).max(24).describe('Row title (<=24 chars)'),
                            description: z
                                .string()
                                .max(72)
                                .optional()
                                .describe('Optional row description (<=72 chars)'),
                        })
                        .describe('List row'),
                )
                .min(1)
                .max(10)
                .describe('1-10 list rows'),
        }),
        async (args) => {
            logger.info({ tool: 'send_list', to: maskRecipient(args.to) }, 'Tool invoked');
            const res = await adaClient.sendList({
                to: args.to,
                text: args.text,
                listTitle: args.listTitle,
                listData: args.listData,
            });
            logger.info(
                {
                    tool: 'send_list',
                    to: maskRecipient(args.to),
                    status: (res as any).status,
                    messageId: (res as any).messageId,
                },
                'Tool completed',
            );
            return { content: [{ type: 'text', text: JSON.stringify(res) }] } as any;
        },
    );

    // send_button
    registerTool(
        'send_button',
        z.object({
            to: z.string().min(5).describe('Recipient phone number (MSISDN)'),
            text: z.string().min(1).max(1024).describe('Message text shown above buttons'),
            buttons: z
                .array(z.string().min(1).max(20).describe('Button label (<=20 chars)'))
                .min(1)
                .max(3)
                .refine(
                    (arr) => new Set(arr.map((s) => s.trim().toLowerCase())).size === arr.length,
                    {
                        message: 'buttons must be unique (case-insensitive)',
                    },
                )
                .describe('1-3 unique buttons'),
            headerType: z
                .enum(['text', 'image'])
                .optional()
                .describe('Header type; "text" or "image" (image uses header as URL)'),
            header: z
                .string()
                .min(1)
                .max(2048)
                .optional()
                .describe('Header text or image URL (required if headerType is set)'),
            footer: z.string().min(1).max(60).optional().describe('Optional footer text'),
        }),
        async (args) => {
            logger.info({ tool: 'send_button', to: maskRecipient(args.to) }, 'Tool invoked');
            const res = await adaClient.sendButton({
                to: args.to,
                text: args.text,
                buttons: args.buttons,
                headerType: args.headerType,
                header: args.header,
                footer: args.footer,
            });
            logger.info(
                {
                    tool: 'send_button',
                    to: maskRecipient(args.to),
                    status: (res as any).status,
                    messageId: (res as any).messageId,
                },
                'Tool completed',
            );
            return { content: [{ type: 'text', text: JSON.stringify(res) }] } as any;
        },
    );

    // send_image
    registerTool(
        'send_image',
        z.object({
            to: z.string().min(5).describe('Recipient phone number (MSISDN)'),
            mediaUrl: z.string().url().describe('Publicly accessible image URL'),
            text: z.string().optional().describe('Optional caption'),
        }),
        async (args) => {
            logger.info({ tool: 'send_image', to: maskRecipient(args.to) }, 'Tool invoked');
            const res = await adaClient.sendImage({
                to: args.to,
                mediaUrl: args.mediaUrl,
                text: args.text,
            });
            logger.info(
                {
                    tool: 'send_image',
                    to: maskRecipient(args.to),
                    status: (res as any).status,
                    messageId: (res as any).messageId,
                },
                'Tool completed',
            );
            return { content: [{ type: 'text', text: JSON.stringify(res) }] } as any;
        },
    );

    // send_image_url (alias of send_image)
    registerTool(
        'send_image_url',
        z.object({
            to: z.string().min(5).describe('Recipient phone number (MSISDN)'),
            mediaUrl: z.string().url().describe('Publicly accessible image URL'),
            text: z.string().optional().describe('Optional caption'),
        }),
        async (args) => {
            logger.info({ tool: 'send_image_url', to: maskRecipient(args.to) }, 'Tool invoked');
            const res = await adaClient.sendImage({
                to: args.to,
                mediaUrl: args.mediaUrl,
                text: args.text,
            });
            logger.info(
                {
                    tool: 'send_image_url',
                    to: maskRecipient(args.to),
                    status: (res as any).status,
                    messageId: (res as any).messageId,
                },
                'Tool completed',
            );
            return { content: [{ type: 'text', text: JSON.stringify(res) }] } as any;
        },
    );

    // send_image_url_list (sequentially send multiple image URLs)
    registerTool(
        'send_image_url_list',
        z.object({
            to: z.string().min(5).describe('Recipient phone number (MSISDN)'),
            mediaUrls: z
                .array(z.string().url())
                .min(1)
                .describe('List of publicly accessible image URLs'),
        }),
        async (args) => {
            logger.info(
                {
                    tool: 'send_image_url_list',
                    to: maskRecipient(args.to),
                    count: args.mediaUrls.length,
                },
                'Tool invoked',
            );
            const results: unknown[] = [];
            for (const url of args.mediaUrls) {
                const res = await adaClient.sendImage({
                    to: args.to,
                    mediaUrl: url,
                });
                results.push(res);
            }
            logger.info(
                { tool: 'send_image_url_list', to: maskRecipient(args.to), sent: results.length },
                'Tool completed',
            );
            return { content: [{ type: 'text', text: JSON.stringify(results) }] } as any;
        },
    );

    // send_image_file
    registerTool(
        'send_image_file',
        z.object({
            to: z.string().min(5).describe('Recipient phone number (MSISDN)'),
            filePath: z.string().min(1).describe('Absolute or relative path to image file'),
            text: z.string().optional().describe('Optional caption'),
        }),
        async (args) => {
            logger.info({ tool: 'send_image_file', to: maskRecipient(args.to) }, 'Tool invoked');
            const res = await adaClient.sendImageFile({
                to: args.to,
                filePath: args.filePath,
                text: args.text,
            });
            logger.info(
                {
                    tool: 'send_image_file',
                    to: maskRecipient(args.to),
                    status: (res as any).status,
                    messageId: (res as any).messageId,
                },
                'Tool completed',
            );
            return { content: [{ type: 'text', text: JSON.stringify(res) }] } as any;
        },
    );

    // send_video_file
    registerTool(
        'send_video_file',
        z.object({
            to: z.string().min(5).describe('Recipient phone number (MSISDN)'),
            filePath: z.string().min(1).describe('Absolute or relative path to video file'),
            text: z.string().optional().describe('Optional caption'),
        }),
        async (args) => {
            logger.info({ tool: 'send_video_file', to: maskRecipient(args.to) }, 'Tool invoked');
            const res = await adaClient.sendVideoFile({
                to: args.to,
                filePath: args.filePath,
                text: args.text,
            });
            logger.info(
                {
                    tool: 'send_video_file',
                    to: maskRecipient(args.to),
                    status: (res as any).status,
                    messageId: (res as any).messageId,
                },
                'Tool completed',
            );
            return { content: [{ type: 'text', text: JSON.stringify(res) }] } as any;
        },
    );

    // send_audio_file
    registerTool(
        'send_audio_file',
        z.object({
            to: z.string().min(5).describe('Recipient phone number (MSISDN)'),
            filePath: z.string().min(1).describe('Absolute or relative path to audio file'),
        }),
        async (args) => {
            logger.info({ tool: 'send_audio_file', to: maskRecipient(args.to) }, 'Tool invoked');
            const res = await adaClient.sendAudioFile({
                to: args.to,
                filePath: args.filePath,
            });
            logger.info(
                {
                    tool: 'send_audio_file',
                    to: maskRecipient(args.to),
                    status: (res as any).status,
                    messageId: (res as any).messageId,
                },
                'Tool completed',
            );
            return { content: [{ type: 'text', text: JSON.stringify(res) }] } as any;
        },
    );

    // send_document_file
    registerTool(
        'send_document_file',
        z.object({
            to: z.string().min(5).describe('Recipient phone number (MSISDN)'),
            filePath: z
                .string()
                .min(1)
                .describe('Absolute or relative path to document file (PDF/DOC/etc.)'),
            text: z.string().optional().describe('Optional caption/filename'),
        }),
        async (args) => {
            logger.info({ tool: 'send_document_file', to: maskRecipient(args.to) }, 'Tool invoked');
            const res = await adaClient.sendDocumentFile({
                to: args.to,
                filePath: args.filePath,
                text: args.text,
            });
            logger.info(
                {
                    tool: 'send_document_file',
                    to: maskRecipient(args.to),
                    status: (res as any).status,
                    messageId: (res as any).messageId,
                },
                'Tool completed',
            );
            return { content: [{ type: 'text', text: JSON.stringify(res) }] } as any;
        },
    );

    // send_product
    registerTool(
        'send_product',
        z.object({
            to: z.string().min(5).describe('Recipient phone number (MSISDN)'),
            catalogId: z.string().min(1).describe('WhatsApp catalog identifier'),
            productId: z.string().min(1).describe('Product identifier within the catalog'),
            text: z.string().optional().describe('Optional product intro text'),
            footer: z.string().optional().describe('Optional footer text'),
        }),
        async (args) => {
            logger.info({ tool: 'send_product', to: maskRecipient(args.to) }, 'Tool invoked');
            const res = await adaClient.sendProduct({
                to: args.to,
                catalogId: args.catalogId,
                productId: args.productId,
                text: args.text,
                footer: args.footer,
            });
            logger.info(
                {
                    tool: 'send_product',
                    to: maskRecipient(args.to),
                    status: (res as any).status,
                    messageId: (res as any).messageId,
                },
                'Tool completed',
            );
            return { content: [{ type: 'text', text: JSON.stringify(res) }] } as any;
        },
    );

    return mcp;
}

export function createTransport(): StreamableHTTPServerTransport {
    return new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // stateless mode
        enableJsonResponse: true,
    });
}
