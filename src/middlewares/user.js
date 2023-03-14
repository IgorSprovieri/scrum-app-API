import { User } from "../controllers/users";

class userMiddleware {
  async checkUser(req, res, next) {
    try {
      const { userId } = req;

      const user = new User({ id: userId });
      const userFound = await user.getOnDB();

      if (!userFound) {
        return res.status(404).json({ error: "User Not Found" });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }
}

export default new userMiddleware();
