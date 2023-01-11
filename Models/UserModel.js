import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Please Enter Your Name"],
      maxLength: [30, "Name cannot exceed 30 characters"],
      minLength: [4, "Name should have more than 4 characters"],
    },
    email: {
      type: String,
      require: [true, "Please Enter Your Email"],
      unique: true,
      validate: [validator.isEmail, "Hãy Nhập Địa chỉ Email"],
    },
    phone: {
      type: String,
      require: true,

    },
    password: {
      type: String,
      require: [true, "Enter You Password"],
   
    },
    avatar: {
      type: String,
      require: false,
      default:"https://res.cloudinary.com/dvtv1j2rn/image/upload/v1672837539/avatars/defaultuser_eg3kpm.png"
    },
    role: {
      type: String,
      default: "user",
    },
    surole: {
      type: String,
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    address: {
      type: String,
      require: true,
      default:"TP Hồ Chí Minh"
    },
    birthday: {
      type: String,
      require: true,
    },
    verificationToken: {
      type: String,
      require: true,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      require: true,
      default: false,
    },

  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
export default User;
