/**
 * This class defines global constants for model-names.
 * So that any change in file name will require only changing them here
 * key:value, where value is the actual model name
 */

const names = {
  /*
    Models
  */

  memberships: 'memberships',
  securityGroups: 'security-groups'
  stores: 'stores',
  users: 'users',
  userSecurityGroups: 'user-security-groups'
  
  /*
     Repository
  */

  knexManager: 'knex-manager',
};

module.exports = names;