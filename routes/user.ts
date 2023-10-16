import express from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = express.Router();

const client = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const { account, password } = req.body;

    if (!account || !password) {
      return res.status(400).json({
        ok: false,
        message: "Not exist data.",
      });
    }

    const existUser = await client.user.findUnique({
      where: {
        account,
      },
    });

    if (existUser) {
      return res.status(400).json({
        ok: false,
        message: "Already exist user.",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await client.user.create({
      data: {
        account,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ account }, process.env.JWT_SECRET_KEY!);

    return res.json({
      ok: true,
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: "Server error.",
    });
  }
});

export default router;
