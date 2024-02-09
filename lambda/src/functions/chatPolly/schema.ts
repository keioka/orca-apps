export default {
  type: "object",
  properties: {
    text: { type: 'string' },
    messageId: { type: 'number' }
  },
  required: ['text', 'messageId']
} as const;
