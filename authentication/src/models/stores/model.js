'use strict';

const Kernel = require('../../repository/').Kernel;
const Names = require('../../constants/modelNames');

// The data repository (database)
const Repository = require('../../repository/').Stores;

/**
 * The model for the stores acts as an interface between the routes/handlers and the database.
 * It contains all data logic pertaining to the store.
 */
class StoreModel {
  constructor(options = {}) {
    this.resource = Names.stores;
    this.repository = options.repository || (new Repository());
    this.logger = this.repository.logger;
  }

  /**
   * Delete all records that are related to this model
   * @async
   */
  async deleteAll() {
    return this.repository.deleteAll();
  }

  /**
   * Delete a Store, also removing all of its members
   * @async
   * @param {string} storeId - the id of the store to be deleted
   */
  async deleteStore(storeId) {
    return this.repository.deleteStore(storeId);
  }

  /**
   * Create a store
   * @async
   * @param {String} storeData - data of the store
   */
  async createStore(storeData) {
    return this.repository.createStore(storeData);
  }

  /**
   * Retrieve the store by storeId
   * @async
   * @param {String} storeId - the id of the store
   */
  async getStoreById(storeId) {
    return this.repository.getStoreById(storeId);
  }

  /**
   * Retrieve the store by its email
   * @async
   * @param {String} storeEmail - the email of the store
   */
  async getStoreByEmail(storeEmail) {
    return this.repository.getStoreByEmail(storeEmail);
  }

  /**
   * Update the store
   * @async
   * @param {String} storeId
   * @param {object} storeData
   */
  async updateStore(storeId, storeData) {
    return this.repository.updateStore(storeId, storeData);
  }
}

// binds base model to the kernel
Kernel.bind(Names.stores, StoreModel);

module.exports = StoreModel;
