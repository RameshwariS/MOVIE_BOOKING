const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (body) => {
  const existing = await User.findOne({ email: body.email });
  if (existing) {
    return { err: 'Email already in use', code: 409 };
  }
  const user = await User.create(body);
  // avoid returning password
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { err: 'Invalid credentials', code: 401 };
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return { err: 'Invalid credentials', code: 401 };
  }

  const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '1d',
  });

  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    return { err: 'User not found', code: 404 };
  }
  return user;
};

const fetchUsers = async (filter) => {
  const query = {};
  if (filter && filter.email) query.email = filter.email;
  const users = await User.find(query).select('-password');
  if (!users) {
    return { err: 'No users found', code: 404 };
  }
  return users;
};

const updateUser = async (id, body) => {
  // If password is being updated, hash it (findByIdAndUpdate bypasses pre-save)
  if (body.password) {
    const salt = await bcrypt.genSalt(10);
    body.password = await bcrypt.hash(body.password, salt);
  }

  const user = await User.findByIdAndUpdate(id, body, { new: true, runValidators: true }).select('-password');
  if (!user) {
    return { err: 'User not found', code: 404 };
  }
  return user;
};

const deleteUser = async (id) => {
  const res = await User.findByIdAndDelete(id);
  if (!res) {
    return { err: 'User not found', code: 404 };
  }
  return { code: 200 };
};

const googleAuthUser = async (idToken) => {
  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  // Verify the Google ID token
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (e) {
    return { err: 'Invalid Google token', code: 401 };
  }

  const { email, name, picture } = payload;
  if (!email) return { err: 'No email in Google token', code: 400 };

  // Upsert: find existing user or create a new one
  let user = await User.findOne({ email });
  if (!user) {
    // Google users get a random unusable password so the schema validator passes
    const placeholder = require('crypto').randomBytes(32).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedPlaceholder = await bcrypt.hash(placeholder, salt);
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      password: hashedPlaceholder,
      role: 'USER',
    });
  }

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1d' }
  );

  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

module.exports = { registerUser, loginUser, getUserById, fetchUsers, updateUser, deleteUser, googleAuthUser };