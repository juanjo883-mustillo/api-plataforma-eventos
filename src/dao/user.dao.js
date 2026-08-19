import { UserModel } from '../models/user.model.js';

export class UserDAO {
  create(data) {
    return UserModel.create(data);
  }

  findById(id) {
    return UserModel.findById(id);
  }

  findByEmail(email) {
    return UserModel.findOne({ email: email.toLowerCase() });
  }

  findAll(filter = {}) {
    return UserModel.find(filter);
  }
}
