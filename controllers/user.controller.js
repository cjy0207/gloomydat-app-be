const User = require("../models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const useController = {};

useController.createUser = async (req, res) => {
  try {
    let { email, password, name, level } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw new Error("User already exist");
    }

    const salt = await bcrypt.genSaltSync(10);
    password = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password,
      name,
      level: level ? level : "customer",
    });
    await newUser.save();
    return res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

useController.getUser = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user) {
      res.status(200).json({ status: "success", user });
    }
    throw new Error("Invalid token");
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = useController;