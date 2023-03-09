import { users } from "../models";
import { object, string, number, date, InferType } from "yup";
import bcrypt from "bcrypt";

class userController {
  async create(req, res) {
    try {
      const schema = object({
        name: string().required(),
        email: string().email().required(),
        password: string().required(),
      });

      await schema.validate(req.body);

      const { name, email, password } = req.body;

      const userFound = await users.findOne({ where: { email: email } });

      if (userFound) {
        return res.status(400).json({ error: "User Already Exists" });
      }

      const password_hash = bcrypt.hashSync(password, 10);

      const result = await users.create({
        name: name,
        email: email,
        password: "",
        password_hash: password_hash,
      });

      if (!result) {
        return res.status(500).json({ error: "User Not Created" });
      }

      return res
        .status(200)
        .json({ id: result.id, name: result.name, email: result.email });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async get(req, res) {
    try {
      const { userId } = req;

      const userFound = await users.findOne({ where: { id: userId } });

      if (!userFound) {
        return res.status(404).json({ error: "User Not Found" });
      }

      return res
        .status(200)
        .json({
          id: userFound.id,
          name: userFound.name,
          email: userFound.email,
        });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }
}

export default new userController();
