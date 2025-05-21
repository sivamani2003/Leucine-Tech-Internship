const { EntitySchema } = require('typeorm');

const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    username: {
      type: 'varchar',
      unique: true,
    },
    password: {
      type: 'varchar',
    },
    role: {
      type: 'varchar',
    },
  },
});

const Software = new EntitySchema({
  name: 'Software',
  tableName: 'software',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar',
    },
    description: {
      type: 'text',
    },
    accessLevels: {
      type: 'simple-array',
    },
  },
});

const Request = new EntitySchema({
  name: 'Request',
  tableName: 'requests',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    accessType: {
      type: 'varchar',
    },
    reason: {
      type: 'text',
    },
    status: {
      type: 'varchar',
      default: 'Pending',
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
    },
    software: {
      type: 'many-to-one',
      target: 'Software',
    },
  },
});

module.exports = { User, Software, Request };
