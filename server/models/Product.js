const knex = require('knex'); // Импортируем knex
const config = require('../../config/knexfile'); // Импортируем конфигурацию

// Создаем экземпляр knex с конфигурацией
const db = knex(config.development);

class Product {
  static async getAll() {
    return db('products').select('*');
  }

  static async getById(id) {
    return db('products').where({ id }).first();
  }

  static async create(product) {
    return db('products').insert(product).returning('*');
  }

  static async delete(id) {
    return db('products').where({ id }).del();
  }
}

module.exports = Product;