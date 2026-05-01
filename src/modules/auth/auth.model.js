import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "client"],
      default: "user",
    },
    // isVerified: {
    //   type: Boolean,
    //   default: false,
    // },
    // verificationToken: { type: String, select: false },
    // refreshToken: { type: String, select: false },
    // resetPasswordToken: { type: String, select: false },
    // resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User =  mongoose.model("User", userSchema);

const clientSchema = new mongoose.Schema(
  {
    client_mail : {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    project_Name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    client_uri: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    support_mail: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    redirect_uri: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    client_secret: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
  },
  { timestamps: true },
);

clientSchema.pre("save", async function () {
  if (!this.isModified("client_secret")) return;
  this.client_secret = await bcrypt.hash(this.client_secret, 12);
});

clientSchema.methods.comparePassword = async function (client_secret) {
  return bcrypt.compare(client_secret, this.client_secret);
};

const Client = mongoose.model("Client",clientSchema);



const authCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    redirect_uri: {
      type: String,
      required: true,
    },

    expires_at: {
      type: Date,
      required: true,
    },

    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const AuthCode = mongoose.model("AuthCode",authCodeSchema);

export {User , Client , AuthCode }

