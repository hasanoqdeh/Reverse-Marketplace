const database = require('../database/connection');

// Base repository class using pg connection
class BaseRepository {
  constructor() {
    this.db = database;
  }
}

module.exports = BaseRepository;
