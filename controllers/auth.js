import User from "../models/user";
import { hashPassword, comparePassword } from "../helpers/auth";
import jwt from "jsonwebtoken";

export const signUp = async (req, res) => {
  //   console.log("register", req.body);
  let { fname, lname, email, password, image, favoritePostsList } = req.body;

  // console.log(fname);
  if (!fname && !lname) {
    return res.status(400).send("First name and Last name are required");
  }
  if (!email) {
    return res.status(400).send("Email is required");
  }
  if (!password) {
    return res.status(400).send("Password is required");
  }
  if (password.length < 6) {
    return res.status(400).send("Password must be at least 6 characters");
  }

  const exist = await User.findOne({ email });

  if (exist) {
    return res.status(400).send("Email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = new User({
    fname,
    lname,
    email,
    image,
    favoritePostsList,
    password: hashedPassword,
  });

  try {
    await user.save();
    console.log("User Registerd", user);
    return res.json({
      ok: "true",
    });
  } catch (err) {
    Console.log("Sign Up Failed", err);
    return res.status(400).send(err);
  }
};

// Log In Controller
export const logIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).send("Email is required");
  }
  if (!password) {
    return res.status(400).send("Password is required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send("Email not found");
  }
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(400).send("Password is incorrect");
  }
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7D",
  });

  user.password = undefined;
  try {
    return res.json({
      ok: "true",
      token,
      user,
    });
  } catch (error) {
    return res.status(400).send(error);
  }
};

export const currentUser = async (req, res) => {
  // console.log(req.auth);
  try {
    const user = await User.findById(req.auth._id);
    return res.json({
      ok: "true",
      user,
    });
  } catch (error) {
    return res.status(400).send(error);
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  // console.log(req.body);
  const userImageData = req.body.image;
  // console.log(userImageData);
  const userId = req.auth._id;
  // console.log(req.auth._id);
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { image: userImageData },
      {
        new: true,
      }
    );
    user.password = undefined;
    // console.log(user);
    const userProfileImageData = user.image;
    return res.json({
      profileImage: "true",
      userProfileImageData,
      user,
    });
  } catch (error) {
    console.log("Error=> ", error);
  }
};
