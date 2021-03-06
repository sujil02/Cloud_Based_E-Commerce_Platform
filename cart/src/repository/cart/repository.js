/**
 * This class defines all the methods to handle calls to db for `cart` resource,
 * using query-builder tool
 */

'use strict';

const logger = require('../../utils/logger');
const Names = require('../../constants/modelNames');
const resource = Names.cart;
const Kernel = require('../kernel');
const knex = require('../knex');

/**
 * Defines primitive functions for interacting with the PostgreSQL database.
 * They only retrieve and return data, they do not contain any data logic -- that is the responsibility of the model.
 */
class ShoppingCartRepository {
  constructor(options = {}) {
    const knexManager = Kernel.resolve(Names.knexManager);

    this.knex = knexManager.knex;
    if (!this.knex) {
      const {
        connection,
        pool = { min: 2, max: 7 },
      } = options;
      this.knex = knex(connection, pool);
    }

    this.logger = logger;
    this.resource = resource;
  }

  /**
   * Inserts the current date and time into Postgres by generating a string that calls a Postgres function.
   */
  postgresDateStr() {
    // Need to use knex.raw() to call Postgres functions
    // Date.now() returns milliseconds, while Postgres to_timestamp() accepts seconds, so need to divide.
    return this.knex.raw(`to_timestamp(${Date.now()} / 1000.0)`);
  }


  /**
   * Delete all carts and their products
   * @async
   */
  async deleteAll() {
    try {
      // Knex doesn't provide a way to cascade, so have to use a raw query
      const query = this.knex.raw(`TRUNCATE TABLE ${this.resource} CASCADE`);
      const result = await query;

      return result;
    }
    catch (err) {
      this.logger.error(err.message);
    }
  }

  /**
   * Get the cart record
   * @async
   * @param {number} cartId - the id associated with a cart
   */
  async getCart(cartId) {
    const carts = this.knex(this.resource);
    const checkCart = carts.select('*').where({cart_id: cartId});
    this.logger.debug(`\tQuery: ${checkCart}`);

    const cartsFound = await checkCart;
    this.logger.debug(`\tResult ${JSON.stringify(cartsFound)}`);
    return cartsFound;
  }

  /**
   * Create a new cart
   * @async
   * @param {number} cartId - the id associated with a cart
   */
  async createCart(cartId, as) {
    const carts = this.knex(this.resource);
    const cartData = {
      cart_id: cartId,
      date_created: this.postgresDateStr(),
      locked: false,
    }

    if (as.uid) {
      cartData.uid = as.uid;
    }
    else {
      cartData.sid = as.sid;
    }

    const createCart = carts.insert(cartData).returning('*');
    this.logger.debug(`\tQuery: ${createCart}`);

    const created = await createCart;
    this.logger.debug(`\tResult: ${JSON.stringify(created)}`);
    return created;
  }

  /**
   * Delete a cart
   * @async
   * @param {number} cartId - the id associated with a cart
   */
  async deleteCart(cartId) {
    // Check if the cart exists
    //  (doing this as a preliminary check reduces the amount of db queries)
    const cartRow = await this.getCart(cartId);
    if (cartRow.length === 0) {
      return 0;
    }

    const carts = this.knex(this.resource);
    const query = carts.where({cart_id: cartId}).del();
    this.logger.debug(`\tQuery: ${query}`);

    const removed = await query;
    this.logger.debug(`\tResult: ${removed}`);
    return removed;
  }

  /**
   * Update the modified timestamp for the cart
   * @async
   * @param {number} cartId - the id associated with a cart
   */
  async modified(cartId) {
    const carts = this.knex(this.resource);
    const query = carts.where({cart_id: cartId}).update({ date_modified: this.postgresDateStr() }, ['cart_id']);
    this.logger.debug(`\tQuery: ${query}`);

    const rows = await query;
    this.logger.debug(`\tResult: ${JSON.stringify(rows)}`);
    return rows;
  }

  /**
   * Lock the cart's row in the database
   * @async
   * @param {number} cartId - the id associated with a cart
   */
  async lockCart(cartId) {
    const carts = this.knex(this.resource);
    const query = carts.where({cart_id: cartId}).update({locked: true}, ['cart_id', 'locked'])
    this.logger.debug(`\tQuery: ${query}`);

    const rows = await query;
    this.logger.debug(`\tResult: ${JSON.stringify(rows)}`);
    return rows;
  }

  /**
   * Unlock the cart's row in the database
   * @async
   * @param {number} cartId - the id associated with a cart
   */
  async unlockCart(cartId) {
    const carts = this.knex(this.resource);
    const query = carts.where({cart_id: cartId}).update({locked: false}, ['cart_id', 'locked'])
    this.logger.debug(`\tQuery: ${query}`);

    const rows = await query;
    this.logger.debug(`\tResult: ${JSON.stringify(rows)}`);
    return rows;
  }

  /**
   * Retrieve the locked status of the cart's row
   * @async
   * @param {number} cartId - the id associated with a cart
   */
  async isLocked(cartId) {
    const carts = this.knex(this.resource);
    const query = carts.select('locked').where({cart_id: cartId});
    this.logger.debug(`\tQuery: ${query}`);

    const result = await query;
    this.logger.debug(`\tResult: ${JSON.stringify(result)}`);

    if (result.length == 0) {
      throw {message: `Cart ${cartId} does not exist.`, what: "cart_does_not_exist"};
    }


    return result[0].locked;
  }

  /**
   * Update the checkout timestamp of a cart
   * @async
   * @param {number} cartId - the id associated with a cart
   */
  async updateCheckoutTime(cartId) {
    const carts = this.knex(this.resource);
    const query = carts.where({cart_id: cartId}).update({date_checkout: this.postgresDateStr()});
    this.logger.debug(`\tQuery: ${query}`);

    const result = await query;
    this.logger.debug(`\tResult: ${JSON.stringify(result)}`);
    return result;
  }

  /**
   * Set a cart's checkout time to NULL
   * @async
   * @param {number} cartId - the id associated with a cart
   */
  async clearCheckoutTime(cartId) {
    const carts = this.knex(this.resource);
    const query = carts.where({cart_id: cartId}).update({date_checkout: null});
    this.logger.debug(`\tQuery: ${query}`);

    const result = await query;
    this.logger.debug(`\tResult: ${JSON.stringify(result)}`);
    return result;
  }
}

module.exports = ShoppingCartRepository;
