import { users } from "../models/users";

class userController {
  async post(req, res) {
    try {
      const result = await users.create({
        name: "bbb",
        email: "ssss@aa.com",
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(error);
    }
  }
}

export default new userController();
