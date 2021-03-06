/**
 * These are the handlers for the endpoints for the stores.
 * It's the code that actually contains the logic for each endpoint.
 */

'use strict';

const logger = require('../../utils/logger');
const { Stores } = require('../../models/');

/**
 * The handler functions for all endpoints defined for the stores
 */
class Handlers {
  constructor() {
    this.stores = new Stores();
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
   * Add a store
   * @async
   * @param {Hapi.request} req - the request object
   * @param {object} rep - the response toolkit (Hapi.h)
   */
  async addStore(req, rep) {
    this.logger.logRequest(req);
    const { payload } = req;

    // Check if request contains a body
    if (!payload) {
      return rep.response({message: "Body cannot be empty."}).code(400);
    }

    // Check if request body contains the required values
    const isValid = Handlers.propsPresent(['name', 'phone', 'email'], payload);
    if (!isValid.valid) {
      return rep.response({message: `${isValid.missing} not specified.`}).code(400);
    }

    this.logger.debug(`\tHandler: Creating a Store ${JSON.stringify(payload)}`);

    try {
      const res = await this.stores.createStore(payload);
      this.logger.debug(`\tResult: ${JSON.stringify(res)}`);

      // Return what was added
      return rep.response({message: "Added store.", data: res}).code(201);
    }

    // Catch any database errors (e.g. product not found) and return the appropriate response
    catch (err) {
      this.logger.error(JSON.stringify(err));
      throw err;
    }
  }

  /**
   * Remove a store
   * @async
   * @param {Hapi.request} req - the request object
   * @param {object} rep - the response toolkit (Hapi.h)
   */
  async deleteStore(req, rep) {
    this.logger.logRequest(req);
    const { params: { id } } = req;

    this.logger.debug(`\tHandler: Removing store ${id}`);

    try {
      const res = await this.stores.deleteStore(id);
      this.logger.debug(`\tResult: ${JSON.stringify(res)}`);

      if (res === 0) {
        return rep.response({message: `Store ${id} not found`}).code(400);
      }
      else {
        // Otherwise, return  how many rows were removed
        return rep.response({message: "Store deleted.", data: res}).code(200);
      }
    }
    catch (err) {
      this.logger.error(JSON.stringify(err));
      throw err;
    }
  }

  
  /**
   * get a store by its id
   * @async
   * @param {Hapi.request} req - the request object
   * @param {object} rep - the response toolkit (Hapi.h)
   */
  async getStoreById(req, rep) {
    const { params: { id }} = req;
    this.logger.logRequest(req);

    try {
      this.logger.debug(`\tHandler: Get a store with id: ${id}`);

      const result = await this.stores.getStoreById(id);
      return rep.response({message: "Stores retrieved.", data: result}).code(200);
    }
    catch(err)  {
      this.logger.error(err.message);
    }
  }

   /**
   * Update the store
   * @async
   * @param {Hapi.request} req - the request object
   * @param {object} rep - the response toolkit (Hapi.h)
   */
  async updateStore(req, rep) {
    this.logger.logRequest(req);
    const { params: { id }, payload } = req;

    // Check if request contains a body
    if (!payload) {
      return rep.response({message: "Body cannot be empty."}).code(400);
    }

    this.logger.debug(`\tHandler: Updating store ${id}`);

    try {
      // Update store information
      const res = await this.stores.updateStore(id, payload);

      return rep.response({message: `Number of stores updated: ${res}`, data: res});
      
    }
    // Catch database errors
    catch(err) {
      this.logger.error(JSON.stringify(err));
    }

  }

}

module.exports = Handlers;
