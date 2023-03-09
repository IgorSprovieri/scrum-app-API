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
        .status(201)
        .json({ id: result.id, name: result.name, email: result.email });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async get(req, res) {
    try {
      const { userId } = req;

      const userFound = await users.findByPk(userId);

      if (!userFound) {
        return res.status(404).json({ error: "User Not Found" });
      }

      return res.status(200).json({
        id: userFound.id,
        name: userFound.name,
        email: userFound.email,
      });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async put(req, res) {
    try {
      const schema = object({
        name: string(),
        email: string().email(),
      });

      await schema.validate(req.body);

      const { name, email } = req.body;
      const { userId } = req;

      if (email) {
        const userFound = await users.findOne({ where: { email: email } });

        if (userFound) {
          return res.status(403).json({ error: "Email Aready Used" });
        }
      }

      const result = await users.update(
        { name: name, email: email },
        {
          where: {
            id: userId,
          },
          returning: true,
          plain: true,
        }
      );

      if (!result[1]) {
        return res.status(500).json({ error: "User Not Updated" });
      }

      return res.status(200).json({
        id: result[1].id,
        name: result[1].name,
        email: result[1].email,
      });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async delete(req, res) {
    try {
      const { userId } = req;

      const result = await users.destroy({
        where: {
          id: userId,
        },
      });

      if (!result) {
        return res.status(500).json({ error: "User Not Deleted" });
      }

      return res.status(200).json({ sucess: true });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }
}

export default new userController();
