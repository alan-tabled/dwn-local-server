const protocolDefinition = {
  message: {
    definition: {
      protocol: 'https://profile.io',
      published: true,
      types: {
        post: {
          schema: 'https://profile.io/schemas/postSchema',
          dataFormats: ['application/json'],
        },
        reply: {
          schema: 'https://profile.io/schemas/replySchema',
          dataFormats: ['application/json'],
        },
      },
      structure: {
        post: {
          $actions: [
            {
              who: 'anyone',
              can: 'read',
            },
            {
              who: 'anyone',
              can: 'write',
            },
          ],
        },
        reply: {
          $actions: [
            {
              who: 'recipient',
              of: 'post',
              can: 'write',
            },
            {
              who: 'author',
              of: 'post',
              can: 'write',
            },
          ],
        },
      },
    },
  },
};

module.exports = {
  protocolDefinition,
};
