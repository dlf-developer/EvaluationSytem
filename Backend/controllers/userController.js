const User = require("../models/User");
const sendEmail = require("../utils/emailService");

const generateCustomerId = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  const randomLetters1 = Array.from({ length: 3 }, () =>
    letters.charAt(Math.floor(Math.random() * letters.length)),
  ).join("");
  const randomDigits = Array.from({ length: 3 }, () =>
    numbers.charAt(Math.floor(Math.random() * numbers.length)),
  ).join("");
  const randomLetters2 = Array.from({ length: 4 }, () =>
    letters.charAt(Math.floor(Math.random() * letters.length)),
  ).join("");

  return randomLetters1 + randomDigits + randomLetters2;
};

const createUser = async (req, res) => {
  try {
    if (req.user.access !== "Superadmin") {
      return res
        .status(403)
        .json({
          message: "Access denied. Only Superadmin can create new users.",
        });
    }
    const {
      employeeId,
      name,
      email,
      mobile,
      access,
      designation,
      coordinator,
      hod,
      motherTeacher,
      subjectTeacher,
      sclass,
      section,
      password,
    } = req.body;

    const customId = generateCustomerId();
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const newUser = new User({
      employeeId,
      customId,
      name,
      email,
      mobile,
      access,
      designation,
      coordinator,
      hod,
      motherTeacher,
      subjectTeacher,
      sclass,
      section,
      password,
    });
    await newUser.save();

    await sendEmail(
      email,
      "Your Account Details",
      `Dear ${name},\n\nYour account has been successfully created.\nUsername: ${email}\nYour password is: ${password}\n\nThank you.`,
    );
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const APIFeatures = require("../utils/apiFeatures");
    const filter = {};

    // Base query
    let query = User.find(filter, "-password");

    // Count total documents before pagination structure
    const countQuery = new APIFeatures(User.find(filter), req.query)
      .filter()
      .search(["name", "email", "employeeId", "customId"]);
    const totalCount = await countQuery.query.countDocuments();

    // Apply features
    const features = new APIFeatures(query, req.query)
      .filter()
      .search(["name", "email", "employeeId", "customId"])
      .sort()
      .paginate();

    const users = await features.query;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    res.status(200).json({
      data: users,
      total: totalCount,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get all Teachers

const GetAllTeachers = async (req, res) => {
  try {
    const users = await User.find(
      {
        access: { $in: ["Teacher"] },
      },
      "-password",
    );
    res.status(200).json(users);
  } catch (err) {
    res.status(400).send(err);
  }
};

const GetAllObserver = async (req, res) => {
  try {
    const users = await User.find(
      {
        access: { $in: ["Observer"] },
      },
      "-password",
    );
    res.status(200).json(users);
  } catch (err) {
    res.status(400).send(err);
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId, "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
      fields: "-password",
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfull" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// app.post("/api/users/bulk-upload", async (req, res) => {
const BulkUserCreate = async (req, res) => {
  const users = req.body;

  try {
    // Map users with custom IDs
    const usersWithCustomIds = users.map((user) => ({
      ...user,
      customId: generateCustomerId(),
    }));

    // Send emails asynchronously for each user
    for (const user of usersWithCustomIds) {
      await sendEmail(
        user.email,
        "Your Account Details",
        `Dear ${user.name},\n\nYour account has been successfully created.\nUsername: ${user.email}\nYour password is: ${user.password}\n\nThank you.`,
      );
    }

    // Insert all users into the database
    await User.insertMany(usersWithCustomIds, { ordered: false }); // `ordered: false` skips duplicates

    res
      .status(200)
      .send({ message: "Users uploaded and emails sent successfully." });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  BulkUserCreate,
  GetAllTeachers,
  GetAllObserver,
};
