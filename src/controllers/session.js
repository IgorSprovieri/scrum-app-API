import { users } from "../models";
import { object, string, number, date, InferType } from "yup";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import randomToken from "random-token";
import { sendForgotEmail } from "../libs/mail";

class sessionController {
  async login(req, res) {
    try {
      const schema = object({
        email: string().email().required(),
        password: string().required(),
      });

      await schema.validate(req.body);

      const { email, password } = req.body;

      const userFound = await users.findOne({ where: { email: email } });

      if (!userFound) {
        return res.status(403).json({ error: "User or password is invalid" });
      }

      const checkPassword = await bcrypt.compare(
        password,
        userFound.password_hash
      );

      if (!checkPassword) {
        return res.status(403).json({ error: "User or password is invalid" });
      }

      const token = jwt.sign({ id: userFound.id }, process.env.HASH_SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).json({
        id: userFound.id,
        name: userFound.name,
        email: userFound.email,
        token: token,
      });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const schema = object({
        email: string().email().required(),
      });

      await schema.validate(req.body);

      const { email } = req.body;

      const userFound = await users.findOne({ where: { email: email } });

      if (!userFound) {
        return res.status(404).json({ error: "User not found" });
      }

      const token = randomToken(6);

      const result = await sendForgotEmail(email, userFound.name, token);

      if (result?.error) {
        return res.status(500).json({ error: "Email not sent" });
      }

      console.log(result);

      await users.update(
        {
          reset_password_token: token,
          reset_password_token_created_at: new Date(),
        },
        {
          where: {
            id: userFound.id,
          },
        }
      );

      return res.status(200).json({ email: email });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }
}

export default new sessionController();
