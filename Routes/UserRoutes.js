import express from "express";
import asyncHandler from "express-async-handler";
import protect, { admin } from "../Middleware/AuthMiddleware.js";
import authorizeRoles from "../Middleware/auth.js";
import generateToken from "../utils/generateToken.js";
import sendToken from "../utils/sendToken.js";
import User from "./../Models/UserModel.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
const userRouter = express.Router();
// Create a transport object using nodemailer
const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: false,
    service: "gmail",
    auth: {
      user: "longvo010203@gmail.com",
      pass: "xoyxmfublwfoqwph",
    }, 
  });

// Generate a random verification token
function generateVerificationToken() {
  return Math.random().toString(36).substring(2);
}
//vadidate email

// Send a verification email
async function sendVerificationEmail(email, verificationToken) {
  const message = {
    from: "longvo010203@gmail.com",
    to: email,
    subject: "Verification Account",
    text: `Please click the following link to verify your email: ${process.env.FRONTEND_URL}/verify/${verificationToken}`,
  };

  await transport.sendMail(message);
}
// verifi token mail
userRouter.get("/verify/:verificationToken", async (req, res) => {
  
  const user = await User.findOneAndUpdate(
    { verificationToken: null },
    { verificationToken: req.params.verificationToken }
  );

  if (user) {
    res.json({ message: "Email verified successfully" });
  } else {
    res.status(404).json({ message: "Invalid verification token" });
  }
});
// REGISTER
userRouter.post(
  "/",
  cors({
    origin: "*",
  }),
  asyncHandler(async (req, res) => {
    const { name, email, phone, password, birthday, address } = req.body;
   
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }
    // Send verification email
    const verificationToken = generateVerificationToken();
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error sending verification email" });
      return;
    }

    // Save verification token in the database
    await User.findOneAndUpdate({ email }, { verificationToken });

    const user = await User.create({
      name,
      email,
      password,
      phone,
      birthday,
      address,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        birthday: user.birthday,
        address: user.address,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid User Data");
    }
  })
);
// LOGIN
userRouter.post(
  "/login",
  cors({
    origin: "*",
  }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (
      user &&
      user.verificationToken != null  &&
      (await user.matchPassword(password))
    ) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        birthday: user.birthday,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      });
    } else if (user && user.verificationToken === null) {
      res.status(401).json({ message: "Please verify your email" });
    } else {
      res.status(401).json({ message: "Invalid Email or Password" });
    }
  })
);

// PROFILE
userRouter.get(
  "/profile",
  protect,
  cors({
    origin: "*",
  }),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        birthday: user.birthday,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);
// UPDATE PROFILE
userRouter.put(
  "/profile",
  protect,
  cors({
    origin: "*",
  }),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: user.phone,
        address: user.address,
        birthday: user.birthday,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);
//CHANGE AVATAR
userRouter.put(
  "/avatar",
  protect,
  cors({
    origin: "*",
  }),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      user.avatar = req.body.avatar || user.avatar;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: user.phone,
        address: user.address,
        birthday: user.birthday,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        avatar: updatedUser.avatar,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

//FORGOT PASSWORD
userRouter.post(
  "/password/forgot",
  cors({ origin: "*" }),
  asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // Instead of passing an error to the next middleware, you can return a response to the client with a descriptive error message
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

    const message = `Tick Gửi Bạn Link Reset Password :- \n\n ${resetPasswordUrl} \n\nIf you have request this email then please ignore it`;
    try {
      await sendEmail({
        email: user.email,
        subject: `Tick Account Password Reset`,
        message,
      });
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}`,
      });
    } catch (error) {
      // It's a good idea to log the error message for debugging purposes
      console.error(error.message);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      // Instead of passing an error to the next middleware, you can return a response to the client with a descriptive error message
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }
  })
);


// RESET FORGOT PASSWORD
userRouter.put(
  "/password/reset/:token",
  cors({ origin: "*" }),
  asyncHandler(async (req, res, next) => {
    // creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      // Instead of passing an error to the next middleware, you can return a response to the client with a descriptive error message
      return res.status(400).json({
        success: false,
        message: "Reset password token is invalid or has expired",
      });
    }

    if (req.body.password !== req.body.confirmPassword) {
      // Instead of passing an error to the next middleware, you can return a response to the client with a descriptive error message
      return res.status(400).json({
        success: false,
        message: "Password does not match confirm password",
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
  })
);

// GET LIST USER
userRouter.get(
  "/list/users",
  protect,
  admin,
  asyncHandler(async (req, res, next) => {
    const users = await User.find({});

    res.status(200).json({
      users,
    });
  })
);
// GET LIST ADMIN
userRouter.get(
  "/list/admin",
  protect,
  admin,
  asyncHandler(async (req, res, next) => {
    const admin = await User.find({ role: "Admin" });

    res.status(200).json({
      admin,
    });
  })
);

//GET 1 USER
userRouter.get(
  "/admin/user/:id",
  authorizeRoles("admin"),
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHander(`User does not exist with Id: ${req.params.id}`)
      );
    }

    res.status(200).json({
      success: true,
      user,
    });
  })
);

// UP ROLE USER
userRouter.put(
  "/admin/user/:id",
  authorizeRoles("admin"),
  asyncHandler(async (req, res, next) => {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  })
);

// DELETE USER
userRouter.delete(
  "/admin/user/:id",
  authorizeRoles("admin"),
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
      );
    }

    await user.remove();

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  })
);

export default userRouter;
