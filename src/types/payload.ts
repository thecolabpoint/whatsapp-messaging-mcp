import { z } from 'zod';

export const commonFieldsSchema = z.object({
  platform: z.string(),
  from: z.string(),
  to: z.string(),
  channel: z.string().optional(),
});

export const textPayloadSchema = commonFieldsSchema.extend({
  type: z.literal('text'),
  text: z.string().min(1),
});

export const listItemSchema = z.object({
  title: z.string().min(1).max(24),
  description: z.string().max(72).optional(),
});

export const listPayloadSchema = commonFieldsSchema.extend({
  type: z.literal('list'),
  text: z.string().min(1).max(1024),
  listTitle: z.string().min(1).max(20),
  listData: z.array(listItemSchema).min(1).max(10),
});

export const buttonPayloadSchema = commonFieldsSchema.extend({
  type: z.literal('button'),
  text: z.string().min(1).max(1024),
  buttons: z
    .array(z.string().min(1).max(20))
    .min(1)
    .max(3)
    .refine((arr) => new Set(arr.map((s) => s.trim().toLowerCase())).size === arr.length, {
      message: 'Button titles must be unique (case-insensitive)',
    }),
  // Optional header/footer. headerType supports 'text' and 'image' (image expects URL in header)
  headerType: z.enum(['text', 'image']).optional(),
  // For image headers the URL may be long; allow up to 2048 chars
  header: z.string().min(1).max(2048).optional(),
  footer: z.string().min(1).max(60).optional(),
});

export const imagePayloadSchema = commonFieldsSchema.extend({
  type: z.literal('media'),
  mediaType: z.literal('image'),
  mediaUrl: z.string().url(),
  text: z.string().optional(),
});

export const productPayloadSchema = commonFieldsSchema.extend({
  type: z.literal('product'),
  catalogId: z.string().min(1),
  productId: z.string().min(1),
  text: z.string().optional(),
  footer: z.string().optional(),
});

export const templatePayloadSchema = commonFieldsSchema.extend({
  type: z.literal('template'),
  templateLang: z.literal('en'),
  templateName: z.literal('cnc_booking_data'),
  headerType: z.literal('text'),
});

// Carousel template (e.g., cnc_botai_carousel_2)
const templateCarouselElementSchema = z.object({
  type: z.enum(['header', 'body']),
  format: z.string().nullable().optional(),
  media_url: z.string().url().nullable().optional(),
  text: z.string().nullable().optional(),
  parameters: z.array(z.any()),
  buttons: z.array(z.any()),
  url: z.string().optional(),
  phone_number: z.string().optional(),
});

export const templateCarouselPayloadSchema = commonFieldsSchema.extend({
  type: z.literal('template'),
  templateLang: z.literal('en'),
  templateName: z.literal('cnc_botai_carousel_2'),
  headerType: z.literal('text'),
  templateCarouselCards: z
    .array(z.tuple([templateCarouselElementSchema, templateCarouselElementSchema]))
    .min(1),
  templateData: z.array(z.any()),
  templateButton: z.array(z.array(z.any())),
});

// 3-image carousel template (e.g., cnc_carouselx_3_a)
export const templateCarousel3PayloadSchema = commonFieldsSchema.extend({
  type: z.literal('template'),
  templateLang: z.literal('en'),
  templateName: z.literal('cnc_carouselx_3_a'),
  headerType: z.literal('text'),
  templateCarouselCards: z
    .array(z.tuple([templateCarouselElementSchema, templateCarouselElementSchema]))
    .min(1),
  templateData: z.array(z.any()),
  templateButton: z.array(z.array(z.any())),
});

// 4-image carousel template (e.g., cnc_carouselx_4_a)
export const templateCarousel4PayloadSchema = commonFieldsSchema.extend({
  type: z.literal('template'),
  templateLang: z.literal('en'),
  templateName: z.literal('cnc_carouselx_4_a'),
  headerType: z.literal('text'),
  templateCarouselCards: z
    .array(z.tuple([templateCarouselElementSchema, templateCarouselElementSchema]))
    .min(1),
  templateData: z.array(z.any()),
  templateButton: z.array(z.array(z.any())),
});

// 5-image carousel template (e.g., cnc_carouselx_5_a)
export const templateCarousel5PayloadSchema = commonFieldsSchema.extend({
  type: z.literal('template'),
  templateLang: z.literal('en'),
  templateName: z.literal('cnc_carouselx_5_a'),
  headerType: z.literal('text'),
  templateCarouselCards: z
    .array(z.tuple([templateCarouselElementSchema, templateCarouselElementSchema]))
    .min(1),
  templateData: z.array(z.any()),
  templateButton: z.array(z.array(z.any())),
});

export type TextPayload = z.infer<typeof textPayloadSchema>;
export type ListPayload = z.infer<typeof listPayloadSchema>;
export type ButtonPayload = z.infer<typeof buttonPayloadSchema>;
export type ImagePayload = z.infer<typeof imagePayloadSchema>;
export type ProductPayload = z.infer<typeof productPayloadSchema>;
export type TemplatePayload = z.infer<typeof templatePayloadSchema>;
export type TemplateCarouselPayload = z.infer<typeof templateCarouselPayloadSchema>;
export type TemplateCarousel3Payload = z.infer<typeof templateCarousel3PayloadSchema>;
export type TemplateCarousel4Payload = z.infer<typeof templateCarousel4PayloadSchema>;
export type TemplateCarousel5Payload = z.infer<typeof templateCarousel5PayloadSchema>;

// Note: multiple schemas share type === 'template', so discriminatedUnion cannot be used.
// Use a standard union so all variants validate correctly.
export const anyPayloadSchema = z.union([
  textPayloadSchema,
  listPayloadSchema,
  buttonPayloadSchema,
  imagePayloadSchema,
  productPayloadSchema,
  templatePayloadSchema,
  templateCarousel5PayloadSchema,
  templateCarousel4PayloadSchema,
  templateCarousel3PayloadSchema,
  templateCarouselPayloadSchema,
]);
export type AnyPayload = z.infer<typeof anyPayloadSchema>;
