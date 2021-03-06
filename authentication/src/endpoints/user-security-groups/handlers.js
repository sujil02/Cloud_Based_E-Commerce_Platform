/**
 * These are the handlers for the endpoints for the user-security-groups.
 * It's the code that actually contains the logic for each endpoint.
 */

'use strict';

const logger = require('../../utils/logger');
const { UserSecurityGroups } = require('../../models/');

/**
 * The handler functions for all endpoints defined for the user-security-groups
 */
class Handlers {
  constructor() {
    this.userSecurityGroups = new UserSecurityGroups();
    this.logger = logger;
  }

  /**
   * Check if properties are present in an object, returns an object with a boolean value.
   * When a property is missing, it also returns the missing property.
   * @static
   * @param {array} proplist - an array of properties that you want to check
   * @param {object} obj - the object to check
   */
  static propsPresent(proplist, obj) {
    for (let prop of proplist) {
      if (!(prop in obj)) {
        return {valid: false, missing: prop};
      }
    }
    return {valid: true};
  }

  /**
   * Add a user-security-groups.
   * @async
   * @param {Hapi.request} req - the request object
   * @param {object} rep - the response toolkit (Hapi.h)
   */
  async createUserSecurityGroup(req, rep) {
    this.logger.logRequest(req);
    const { payload } = req;

    // Check if request contains a body
    if (!payload) {
      return rep.response({message: "Body cannot be empty."}).code(400);
    }

    // Check if request body contains the required values
    const isValid = Handlers.propsPresent(['userId', 'storeId', 'securityGroupId'], payload);
    if (!isValid.valid) {
      return rep.response({message: `${isValid.missing} not specified.`}).code(400);
    }

    const { userId, storeId, securityGroupId } = payload;
    this.logger.debug(`\tHandler: Creating User Security group ${JSON.stringify(payload)}`);

    try {
      const res = await this.userSecurityGroups.createUserSecurityGroup(userId, storeId, securityGroupId);
      this.logger.debug(`\tResult: ${JSON.stringify(res)}`);

      // Return what was added
      return rep.response({message: "User security group created", data: res}).code(201);
    }

    catch (err) {
      this.logger.error(JSON.stringify(err));
      throw err;
    }
  }

  /**
   * Remove a user-security-groups by user id
   * @async
   * @param {Hapi.request} req - the request object
   * @param {object} rep - the response toolkit (Hapi.h)
   */
  async removeUserSecurityGroupByUserId(req, rep) {
    this.logger.logRequest(req);
    const { params: { userId } } = req;

    this.logger.debug(`\tHandler: Removing user security group by user ${userId}`);

    try {
      const res = await this.userSecurityGroups.deleteUSGroupByUserId(userId);
      this.logger.debug(`\tResult: ${JSON.stringify(res)}`);

      if (res === 0) {
        return rep.response({message: `User Security Group does not exist for user ${userId}`})
        .code(400);
      }
      else {
        // Otherwise, return  how many rows were removed
        return rep.response({message: "User security group removed.", data: res}).code(200);
      }
    }
    catch (err) {
      this.logger.error(JSON.stringify(err));
      throw err;
    }
  }

  /**
   * Remove a user-security-groups
   * @async
   * @param {Hapi.request} req - the request object
   * @param {object} rep - the response toolkit (Hapi.h)
   */
  async removeUserSecurityGroup(req, rep) {
    this.logger.logRequest(req);
    const { params: { userId, storeId } } = req;

    this.logger.debug(`\tHandler: Removing user security group for user ${userId} in store ${storeId}`);

    try {
      const res = await this.userSecurityGroups.deleteUSGroup(userId, storeId);
      this.logger.debug(`\tResult: ${JSON.stringify(res)}`);

      // If no rows were removed, respond with a 400.
      if (res === 0) {
        return rep.response({message: `User Security Group does not exist with user ${userId} and store ${storeId}.`})
        .code(400);
      }
      else {
        // Otherwise, return how many rows were removed
        return rep.response({message: "User security group removed.", data: res}).code(200);
      }
    }
    catch (err) {
      this.logger.error(JSON.stringify(err));
      throw err;
    }
  }

  /**
   * Get a user-security-group
   * @async
   * @param {Hapi.request} req - the request object
   * @param {object} rep - the response toolkit (Hapi.h)
   */
  async getUserSecurityGroup(req, rep) {
    const { params: { userId, storeId }} = req;
    this.logger.logRequest(req);

    try {
      this.logger.debug(`\tHandler: Get user security Group for user ${userId} in store ${storeId}`);

      const result = await this.userSecurityGroups.getUSGroupByUserIdStoreId(userId, storeId);
      return rep.response({message: "User Security Group retrieved.", data: result}).code(200);
    }
    catch(err)  {
      this.logger.error(err.message);
    }
  }
}

module.exports = Handlers;
