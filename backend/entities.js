const { EntitySchema } = require('typeorm');

// User entity
const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    username: {
      type: 'varchar',
      unique: true,
      nullable: false
    },
    password: {
      type: 'varchar',
      nullable: false
    },
    role: {
      type: 'varchar',
      default: 'Employee',
      nullable: false
    }
  }
});

// Software entity
const Software = new EntitySchema({
  name: 'Software',
  tableName: 'software',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    name: {
      type: 'varchar',
      unique: true,
      nullable: false
    },
    description: {
      type: 'text',
      nullable: true
    },
    accessLevels: {
      type: 'simple-json',
      nullable: true,
      default: '["Read","Write","Admin"]'
    }
  }
});

// Request entity
const Request = new EntitySchema({
  name: 'Request',
  tableName: 'requests',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    accessType: {
      type: 'varchar',
      nullable: false
    },
    reason: {
      type: 'text',
      nullable: false
    },
    status: {
      type: 'varchar',
      default: 'Pending',
      nullable: false
    },
    createdAt: {
      // Changed from 'timestamp' to 'datetime' for SQLite compatibility
      type: 'datetime',
      createDate: true
    }
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'userId',
        referencedColumnName: 'id'
      }
    },
    software: {
      type: 'many-to-one',
      target: 'Software',
      joinColumn: {
        name: 'softwareId',
        referencedColumnName: 'id'
      }
    }
  }
});

module.exports = {
  User,
  Software,
  Request
};
