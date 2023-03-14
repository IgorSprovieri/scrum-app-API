import { users } from "../models";
import { object, string, number, date, InferType } from "yup";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import randomToken from "random-token";
import { sendForgotEmail } from "../libs/mail";
import { differenceInMinutes } from "date-fns";

export class User {
  id;
  email;
  name;
  password;
  password_hash;
  reset_password_token;
  reset_password_token_created_at;
  avatar_url;

  constructor(data) {
    const { id, name, email, password } = data;
    if (id) {
      this.id = id;
    }
    if (name) {
      this.name = name;
    }
    if (email) {
      this.email = email;
    }
    if (password) {
      this.password = "";
      this.password_hash = bcrypt.hashSync(password, 10);
    }
  }

  async getOnDB() {
    let whereParam;
    if (this.id) {
      whereParam = { where: { id: this.id } };
    } else {
      whereParam = { where: { email: this.email } };
    }

    try {
      const result = await users.findOne(whereParam);
      if (result) {
        const {
          id,
          email,
          name,
          password_hash,
          reset_password_token,
          reset_password_token_created_at,
          avatar_url,
        } = result;
        this.id = id;
        this.email = email;
        this.name = name;
        this.password_hash = password_hash;
        this.reset_password_token = reset_password_token;
        this.reset_password_token_created_at = reset_password_token_created_at;
        this.avatar_url = avatar_url;
      }
      return result;
    } catch (error) {
      return error;
    }
  }

  async createOnDB() {
    try {
      const newUser = await users.create({ ...this });
      this.id = newUser.id;
      return newUser;
    } catch (error) {
      return error;
    }
  }

  async updateOnDB() {
    try {
      const updatedUser = await users.update(
        { ...this },
        {
          where: {
            id: this.id,
          },
          returning: true,
          plain: true,
        }
      );
      return updatedUser;
    } catch (error) {
      return error;
    }
  }

  async deleteOnDB() {
    try {
      const deletedUser = await users.destroy({
        where: {
          id: this.id,
        },
      });
      return deletedUser;
    } catch (error) {
      return error;
    }
  }

  async checkPassword(password) {
    try {
      return await bcrypt.compare(password, this.password_hash);
    } catch (error) {
      return error;
    }
  }

  gerenateJWT() {
    return jwt.sign({ id: this.id }, process.env.HASH_SECRET, {
      expiresIn: "7d",
    });
  }

  async sendForgotEmail() {
    try {
      const token = randomToken(6);
      this.reset_password_token = bcrypt.hashSync(token, 10);
      this.reset_password_token_created_at = new Date();
      await this.updateOnDB();
      return await sendForgotEmail(this.email, this.name, token);
    } catch (error) {
      return error;
    }
  }

  async checkToken(token) {
    try {
      const result = await bcrypt.compare(token, this.reset_password_token);
      if (!result) {
        return false;
      }
      const difference = differenceInMinutes(
        new Date(),
        this.reset_password_token_created_at
      );
      return difference < 15;
    } catch (error) {
      return error;
    }
  }

  async changePassword(password) {
    try {
      this.password = "";
      this.password_hash = bcrypt.hashSync(password, 10);
      return await this.updateOnDB();
    } catch (error) {
      return error;
    }
  }
}

class Controller {
  async post(req, res) {
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

      const user = new User({ name: name, email: email, password: password });

      const result = await user.createOnDB();

      if (!result) {
        return res.status(500).json({ error: "User Not Created" });
      }

      return res
        .status(201)
        .json({ id: user.id, name: user.name, email: user.email });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async get(req, res) {
    try {
      const { user } = req;

      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
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
      const { user } = req;

      if (name) {
        user.name = name;
      }

      if (email) {
        const alreadyUsed = await users.findOne({ where: { email: email } });

        if (alreadyUsed) {
          return res.status(403).json({ error: "Email Aready Used" });
        }

        user.email = email;
      }

      const result = await user.updateOnDB();

      if (!result) {
        return res.status(500).json({ error: "User Not Updated" });
      }

      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async delete(req, res) {
    try {
      const { user } = req;

      const result = await user.deleteOnDB();

      if (result == 0) {
        return res.status(500).json({ error: "User Not Deleted" });
      }

      return res.status(200).json({ sucess: true });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async login(req, res) {
    try {
      const schema = object({
        email: string().email().required(),
        password: string().required(),
      });

      await schema.validate(req.body);

      const { email, password } = req.body;

      const user = new User({ email: email });
      const userFound = await user.getOnDB();

      if (!userFound) {
        return res.status(403).json({ error: "User or password is invalid" });
      }

      const checkPassword = await user.checkPassword(password);

      if (!checkPassword) {
        return res.status(403).json({ error: "User or password is invalid" });
      }

      const token = user.gerenateJWT();

      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
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

      const user = new User({ email: email });
      const userFound = await user.getOnDB();

      if (!userFound) {
        return res.status(404).json({ error: "User Not Found" });
      }

      const result = await user.sendForgotEmail();

      if (!result) {
        return res.status(500).json({ error: "Email Not Sent" });
      }

      return res.status(200).json({ email: user.email });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const schema = object({
        email: string().email().required(),
        token: string().required(),
        password: string().required(),
      });

      await schema.validate(req.body);

      const { email, token, password } = req.body;

      const user = new User({ email: email });
      const userFound = await user.getOnDB();

      if (!userFound) {
        return res.status(404).json({ error: "User Not Found" });
      }

      const tokenResult = await user.checkToken(token);

      if (!tokenResult) {
        return res.status(403).json({ error: "Token Not Valid" });
      }

      const result = await user.changePassword(password);

      if (!result) {
        return res.status(500).json({ error: "Password Not Updated" });
      }

      return res.status(200).json({ sucess: true });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }
}

export default new Controller();
