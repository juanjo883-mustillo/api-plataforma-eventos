import { UserDAO } from '../dao/user.dao.js';

export class UserRepository {
  constructor(dao = new UserDAO()) {
    this.dao = dao;
  }

  createUser(data) {
    return this.dao.create(data);
  }

  getUserById(id) {
    return this.dao.findById(id);
  }

  getUserByEmail(email) {
    return this.dao.findByEmail(email);
  }

  getAllUsers(filter) {
    return this.dao.findAll(filter);
  }
}
