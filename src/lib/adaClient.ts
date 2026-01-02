import { postFormData, postJson } from './httpClient.js';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { env } from '../config/env.js';
import {
    anyPayloadSchema,
    buttonPayloadSchema,
    imagePayloadSchema,
    listPayloadSchema,
    productPayloadSchema,
    textPayloadSchema,
    type AnyPayload,
    type ButtonPayload,
    type ImagePayload,
    type ListPayload,
    type ProductPayload,
    type TextPayload,
} from '../types/payload.js';

export interface AdaResponse {
    messageId?: string;
    status?: string;
    [key: string]: unknown;
}

function withCommon<T extends Record<string, unknown>>(
    to: string,
    partial: T,
): T & {
    platform: string;
    from: string;
    to: string;
    channel?: string;
} {
    const base: any = {
        platform: env.BMP_PLATFORM,
        from: env.BMP_SENDER_MSISDN,
        to,
    };
    if (env.BMP_CHANNEL) base.channel = env.BMP_CHANNEL;
    return { ...base, ...partial };
}

export const adaClient = {
    async sendText(args: {
        to: string;
        text: string;
    }): Promise<AdaResponse> {
        const payload: TextPayload = textPayloadSchema.parse(
            withCommon(args.to, { type: 'text', text: args.text }),
        );
        const { data } = await postJson<AdaResponse>('/message', payload, env.BMP_ACCESS_TOKEN);
        return data;
    },

    async sendList(args: {
        to: string;
        text: string;
        listTitle: string;
        listData: (string | { title: string; description?: string })[];
    }): Promise<AdaResponse> {
        const normalized = args.listData.map((item) =>
            typeof item === 'string' ? { title: item } : item,
        );
        const payload: ListPayload = listPayloadSchema.parse(
            withCommon(args.to, {
                type: 'list',
                text: args.text,
                listTitle: args.listTitle,
                listData: normalized,
            }),
        );
        const { data } = await postJson<AdaResponse>('/message', payload, env.BMP_ACCESS_TOKEN);
        return data;
    },

    async sendButton(args: {
        to: string;
        text: string;
        buttons: string[];
        headerType?: 'text' | 'image';
        header?: string;
        footer?: string;
    }): Promise<AdaResponse> {
        const payload: ButtonPayload = buttonPayloadSchema.parse(
            withCommon(args.to, {
                type: 'button',
                text: args.text,
                buttons: args.buttons,
                headerType: args.headerType,
                header: args.header,
                footer: args.footer,
            }),
        );
        const { data } = await postJson<AdaResponse>('/message', payload, env.BMP_ACCESS_TOKEN);
        return data;
    },

    async sendImage(args: {
        to: string;
        mediaUrl: string;
        text?: string;
    }): Promise<AdaResponse> {
        const payload: ImagePayload = imagePayloadSchema.parse(
            withCommon(args.to, {
                type: 'media',
                mediaType: 'image',
                mediaUrl: args.mediaUrl,
                text: args.text,
            }),
        );
        const { data } = await postJson<AdaResponse>('/message', payload, env.BMP_ACCESS_TOKEN);
        return data;
    },

    async sendProduct(args: {
        to: string;
        catalogId: string;
        productId: string;
        text?: string;
        footer?: string;
    }): Promise<AdaResponse> {
        const payload: ProductPayload = productPayloadSchema.parse(
            withCommon(args.to, {
                type: 'product',
                catalogId: args.catalogId,
                productId: args.productId,
                text: args.text,
                footer: args.footer,
            }),
        );
        const { data } = await postJson<AdaResponse>('/message', payload, env.BMP_ACCESS_TOKEN);
        return data;
    },

    async sendImageFile(args: {
        to: string;
        filePath: string;
        text?: string;
    }): Promise<AdaResponse> {
        const { to, filePath, text } = args;
        const fileBuf = readFileSync(filePath);
        const filename = basename(filePath);
        const { data } = await postFormData<AdaResponse>(
            '/message/media',
            (form) => {
                form.append('file', new Blob([fileBuf]), filename);
                form.append('from', env.BMP_SENDER_MSISDN);
                form.append('to', to);
                form.append('platform', env.BMP_PLATFORM);
                if (env.BMP_CHANNEL) form.append('channel', env.BMP_CHANNEL);
                form.append('mediaType', 'image');
                if (text) form.append('text', text);
            },
            env.BMP_ACCESS_TOKEN,
        );
        return data;
    },

    async sendVideoFile(args: {
        to: string;
        filePath: string;
        text?: string;
    }): Promise<AdaResponse> {
        const { to, filePath, text } = args;
        const fileBuf = readFileSync(filePath);
        const filename = basename(filePath);
        const { data } = await postFormData<AdaResponse>(
            '/message/media',
            (form) => {
                form.append('file', new Blob([fileBuf]), filename);
                form.append('from', env.BMP_SENDER_MSISDN);
                form.append('to', to);
                form.append('platform', env.BMP_PLATFORM);
                if (env.BMP_CHANNEL) form.append('channel', env.BMP_CHANNEL);
                form.append('mediaType', 'video');
                if (text) form.append('text', text);
            },
            env.BMP_ACCESS_TOKEN,
        );
        return data;
    },

    async sendAudioFile(args: {
        to: string;
        filePath: string;
    }): Promise<AdaResponse> {
        const { to, filePath } = args;
        const fileBuf = readFileSync(filePath);
        const filename = basename(filePath);
        const { data } = await postFormData<AdaResponse>(
            '/message/media',
            (form) => {
                form.append('file', new Blob([fileBuf]), filename);
                form.append('from', env.BMP_SENDER_MSISDN);
                form.append('to', to);
                form.append('platform', env.BMP_PLATFORM);
                if (env.BMP_CHANNEL) form.append('channel', env.BMP_CHANNEL);
                form.append('mediaType', 'audio');
            },
            env.BMP_ACCESS_TOKEN,
        );
        return data;
    },

    async sendDocumentFile(args: {
        to: string;
        filePath: string;
        text?: string;
    }): Promise<AdaResponse> {
        const { to, filePath, text } = args;
        const fileBuf = readFileSync(filePath);
        const filename = basename(filePath);
        const { data } = await postFormData<AdaResponse>(
            '/message/media',
            (form) => {
                form.append('file', new Blob([fileBuf]), filename);
                form.append('from', env.BMP_SENDER_MSISDN);
                form.append('to', to);
                form.append('platform', env.BMP_PLATFORM);
                if (env.BMP_CHANNEL) form.append('channel', env.BMP_CHANNEL);
                form.append('mediaType', 'document');
                if (text) form.append('text', text);
            },
            env.BMP_ACCESS_TOKEN,
        );
        return data;
    },

    // Generic entry for future use
    async sendRaw(args: {
        payload: AnyPayload;
        to: string;
    }): Promise<AdaResponse> {
        const base = withCommon(args.to, args.payload as AnyPayload);
        const valid = anyPayloadSchema.parse(base);
        const { data } = await postJson<AdaResponse>('/message', valid, env.BMP_ACCESS_TOKEN);
        return data;
    },
};
