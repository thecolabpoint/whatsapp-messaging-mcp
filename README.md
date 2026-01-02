# WhatsApp Messaging MCP Server

MCP server for sending WhatsApp messages via ADA BMP API. Supports text, list, button, image, product, and media file uploads.

## Installation

```bash
npm install @adaglobal/whatsapp-messaging-mcp
```

## MCP Client Configuration

Add to your MCP client configuration (e.g., Claude Desktop's `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "whatsapp-messaging": {
      "command": "npx",
      "args": ["@adaglobal/whatsapp-messaging-mcp"],
      "env": {
        "BMP_API_BASE_URL": "https://your-api-url.com",
        "BMP_ACCESS_TOKEN": "your-bearer-token",
        "BMP_SENDER_MSISDN": "628xxxxxxxxx",
        "BMP_PLATFORM": "WA",
        "BMP_CHANNEL": "LIVECHAT"
      }
    }
  }
}
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BMP_API_BASE_URL` | Yes | BMP API base URL |
| `BMP_ACCESS_TOKEN` | Yes | Bearer token for API authentication |
| `BMP_SENDER_MSISDN` | Yes | Sender phone number (MSISDN) |
| `BMP_PLATFORM` | Yes | Platform identifier (e.g., "WA") |
| `BMP_CHANNEL` | No | Channel identifier (e.g., "LIVECHAT") |

## Available Tools

| Tool | Description |
|------|-------------|
| `send_text` | Send plain text message |
| `send_list` | Send interactive list selection (1-10 items) |
| `send_button` | Send button message (1-3 buttons, optional header/footer) |
| `send_image` | Send image via URL |
| `send_image_url` | Alias for send_image |
| `send_image_url_list` | Send multiple images sequentially |
| `send_image_file` | Send image file upload |
| `send_video_file` | Send video file upload |
| `send_audio_file` | Send audio file upload |
| `send_document_file` | Send document file upload (PDF/DOC) |
| `send_product` | Send WhatsApp product catalog item |

## Tool Examples

### send_text
```json
{ "to": "628116823073", "text": "Hello, world!" }
```

### send_list
```json
{
  "to": "628116823073",
  "text": "Please choose an option:",
  "listTitle": "Options",
  "listData": [
    { "title": "Option 1", "description": "First choice" },
    { "title": "Option 2", "description": "Second choice" }
  ]
}
```

### send_button
```json
{
  "to": "628116823073",
  "text": "Would you like to proceed?",
  "buttons": ["Yes", "No", "Maybe"]
}
```

### send_image
```json
{
  "to": "628116823073",
  "mediaUrl": "https://example.com/image.jpg",
  "text": "Check out this image!"
}
```

### send_product
```json
{
  "to": "628116823073",
  "catalogId": "your-catalog-id",
  "productId": "your-product-id",
  "text": "Check out this product!"
}
```

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build
npm run build

# Run tests
npm test
```

## License

MIT
