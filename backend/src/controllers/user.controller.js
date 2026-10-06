import httpStatus from "http-status";
import bcrypt from "bcrypt";

import { User } from "../models/user.model.js";
import { Meeting } from "../models/meeting.model.js";
import { createToken } from "../utils/token.js";

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "Username and password are required." });
  }

  try {
    const normalizedUsername = username.trim();
    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid username or password." });
    }

    const token = createToken({ userId: user._id.toString(), username: user.username });
    user.token = token;
    await user.save();

    return res.status(httpStatus.OK).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
      },
      message: "Login successful.",
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong: ${error.message}` });
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "Name, username, and password are required." });
  }

  try {
    const normalizedUsername = username.trim();
    const existingUser = await User.findOne({ username: normalizedUsername });

    if (existingUser) {
      return res.status(httpStatus.CONFLICT).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name.trim(),
      username: normalizedUsername,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(httpStatus.CREATED).json({ message: "User registered successfully." });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong: ${error.message}` });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const meetings = await Meeting.find({ user_id: req.user._id.toString() }).sort({ date: -1 });
    return res.status(httpStatus.OK).json(meetings);
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong: ${error.message}` });
  }
};

const addToHistory = async (req, res) => {
  const { meeting_code } = req.body;

  if (!meeting_code) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "Meeting code is required." });
  }

  try {
    const meetingCode = meeting_code.trim();
    const existingMeeting = await Meeting.findOne({
      user_id: req.user._id.toString(),
      meetingCode,
    });

    if (existingMeeting) {
      return res.status(httpStatus.OK).json({ message: "Meeting already saved in your history." });
    }

    const newMeeting = new Meeting({
      user_id: req.user._id.toString(),
      meetingCode,
      joinedUsers: [req.user.username],
    });

    await newMeeting.save();

    return res.status(httpStatus.CREATED).json({
      message: "Meeting added to history.",
      meeting: newMeeting,
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong: ${error.message}` });
  }
};

export { login, register, getUserHistory, addToHistory };