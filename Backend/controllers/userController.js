const User = require("../models/User");
const sendEmail = require("../utils/emailService");
const { accountCreatedEmail } = require("../utils/emailTemplates");
const { recordAuditLog, calculateDiff } = require("../utils/auditLogger");
const { revokeUserTokens } = require("../utils/tokenCache");

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

const VALID_USER_ROLES = ["Superadmin", "Observer", "Teacher"];

const isTruthyFlag = (value) => value === true || value === "true";

/**
 * Resolve role and Observer-only special privileges (`isDualRole` / OT and `canAddNotebookComment`).
 * OT is never a standalone role; it can only be enabled as a privilege on an Observer account.
 */
const resolveRoleAndPrivileges = ({ access, isDualRole, canAddNotebookComment }) => {
  const normalizedAccess = access === "OT" ? "Observer" : access;
  const isObserver = normalizedAccess === "Observer";
  const resolvedDualRole = isObserver && isTruthyFlag(isDualRole);
  const resolvedNotebookComment = isObserver && isTruthyFlag(canAddNotebookComment);
  return {
    access: normalizedAccess,
    isDualRole: resolvedDualRole,
    canAddNotebookComment: resolvedNotebookComment,
    roles: resolvedDualRole ? ["Observer", "Teacher"] : [normalizedAccess],
  };
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

    if (!VALID_USER_ROLES.includes(access)) {
      return res.status(400).json({
        message:
          access === "OT"
            ? "OT is not a role. Select role 'Observer' and enable the OT (Dual Role) privilege instead."
            : `Invalid access role '${access}'. Allowed roles are: ${VALID_USER_ROLES.join(", ")}.`,
      });
    }

    const email = req.body.email?.toLowerCase().trim();
    const customId = generateCustomerId();
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const roleFields = resolveRoleAndPrivileges({
      access,
      isDualRole: req.body.isDualRole,
      canAddNotebookComment: req.body.canAddNotebookComment,
    });

    const newUser = new User({
      employeeId,
      customId,
      name,
      email,
      mobile,
      ...roleFields,
      isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
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

    recordAuditLog({
      req,
      action: 'CREATE',
      module: 'User Management',
      targetId: newUser._id,
      details: `Created user ${name} (${email} - ${roleFields.access}${roleFields.isDualRole ? ' with OT privilege' : ''})`,
    });

    const emailData = accountCreatedEmail({ recipientName: name, email, password });
    await sendEmail(email, emailData.subject, emailData.html);
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
        isActive: { $ne: false },
        $or: [
          { access: "Teacher" },
          { access: "OT" },
          { isDualRole: true },
          { isDualRole: "true" },
          { roles: "Teacher" },
        ],
      },
      "-password",
    ).sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (err) {
    return res.status(400).send(err);
  }
};

const GetAllObserver = async (req, res) => {
  try {
    const users = await User.find(
      {
        isActive: { $ne: false },
        $or: [
          { access: "Observer" },
          { access: "OT" },
          { isDualRole: true },
          { isDualRole: "true" },
          { roles: "Observer" },
        ],
      },
      "-password",
    ).sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (err) {
    return res.status(400).send(err);
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
    const updateData = { ...req.body };

    if (updateData.access !== undefined && !VALID_USER_ROLES.includes(updateData.access)) {
      return res.status(400).json({
        message:
          updateData.access === "OT"
            ? "OT is not a role. Assign role 'Observer' and enable the OT (Dual Role) privilege instead."
            : `Invalid access role '${updateData.access}'. Allowed roles are: ${VALID_USER_ROLES.join(", ")}.`,
      });
    }

    const existingUser = await User.findById(userId).select('-password');
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (updateData.isActive !== undefined) {
      updateData.isActive = Boolean(updateData.isActive);
    }

    if (
      updateData.access !== undefined ||
      updateData.isDualRole !== undefined ||
      updateData.canAddNotebookComment !== undefined ||
      existingUser.access === "OT"
    ) {
      const effectiveAccess =
        updateData.access !== undefined
          ? updateData.access
          : existingUser.access === "OT"
            ? "Observer"
            : existingUser.access;
      const effectiveDualRole =
        updateData.isDualRole !== undefined
          ? updateData.isDualRole
          : existingUser.access === "OT" || existingUser.isDualRole;
      const effectiveNotebookComment =
        updateData.canAddNotebookComment !== undefined
          ? updateData.canAddNotebookComment
          : existingUser.canAddNotebookComment;

      const resolved = resolveRoleAndPrivileges({
        access: effectiveAccess,
        isDualRole: effectiveDualRole,
        canAddNotebookComment: effectiveNotebookComment,
      });

      updateData.access = resolved.access;
      updateData.isDualRole = resolved.isDualRole;
      updateData.canAddNotebookComment = resolved.canAddNotebookComment;
      updateData.roles = resolved.roles;
    }

    const userDiff = calculateDiff(existingUser, updateData, ['password', '_id', '__v']);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
      fields: "-password",
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Real-Time Inactivity Guard: If deactivated, immediately revoke all sessions in Token Cache
    if (updateData.isActive === false) {
      await revokeUserTokens(userId);
    }

    recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'User Management',
      targetId: userId,
      details: `Updated user ${updatedUser.name} (${updatedUser.email})`,
      changes: userDiff,
    });

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

    // Invalidate all tokens for deleted user
    await revokeUserTokens(userId);

    recordAuditLog({
      req,
      action: 'DELETE',
      module: 'User Management',
      targetId: userId,
      details: `Deleted user ${deletedUser.name} (${deletedUser.email})`,
    });

    res.status(200).json({ message: "User deleted successfull" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// app.post("/api/users/bulk-upload", async (req, res) => {
const BulkUserCreate = async (req, res) => {
  const users = Array.isArray(req.body) ? req.body : [];

  try {
    for (const user of users) {
      const rawAccess = typeof user?.access === "string" ? user.access.trim() : user?.access;
      if (!VALID_USER_ROLES.includes(rawAccess)) {
        return res.status(400).json({
          message:
            rawAccess === "OT"
              ? "OT is not a valid role in bulk upload. Set access to 'Observer' (with optional isDualRole = true)."
              : `Invalid access role '${rawAccess}' in bulk upload. Allowed roles: ${VALID_USER_ROLES.join(", ")}.`,
        });
      }
    }

    // Normalize emails, role privileges, and assign custom IDs
    const usersWithCustomIds = users.map((user) => {
      const rawAccess = typeof user?.access === "string" ? user.access.trim() : user?.access;
      const roleFields = resolveRoleAndPrivileges({
        access: rawAccess,
        isDualRole: user?.isDualRole,
        canAddNotebookComment: user?.canAddNotebookComment,
      });
      return {
        ...user,
        ...roleFields,
        email: user.email?.toLowerCase().trim(),
        customId: generateCustomerId(),
      };
    });

    // Send emails asynchronously for each user
    for (const user of usersWithCustomIds) {
      const emailData = accountCreatedEmail({ recipientName: user.name, email: user.email, password: user.password });
      await sendEmail(user.email, emailData.subject, emailData.html);
    }

    // Insert all users into the database
    await User.insertMany(usersWithCustomIds, { ordered: false }); // `ordered: false` skips duplicates

    recordAuditLog({
      req,
      action: 'BULK_CREATE',
      module: 'User Management',
      details: `Bulk uploaded ${usersWithCustomIds.length} user(s)`,
    });

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
