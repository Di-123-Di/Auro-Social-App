import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserSchema } from './user.schema.js';
import crypto from 'crypto';

const UserModel = mongoose.model("User", UserSchema);

export async function createUser(user) {
   return UserModel.create(user);
}

export async function findUserByUsername(username) {
   return UserModel.findOne({ username: username }).exec();
}

export async function findUserById(userId) {
   return UserModel.findById(userId).exec();
}

export async function findUserByEmail(email) {
   return UserModel.findOne({ email: email }).exec();
}

export async function updateUserDescription(userId, description) {
   return UserModel.findByIdAndUpdate(
       userId,
       { description: description },
       { new: true }
   ).exec();
}

export async function updateUserStatus(username, status) {
   return UserModel.findOneAndUpdate(
       { username: username },
       { status: status },
       { new: true }
   ).exec();
}

export async function updateUserAvatar(userId, avatarUrl) {
  return UserModel.findByIdAndUpdate(
    userId,
    { avatar: avatarUrl },
    { new: true }
  ).exec();
}

export async function searchUsers(searchTerm) {
   return UserModel.find({
     username: {
        $regex: searchTerm,
        $options: 'i'
      }
   })
   .select('username joinedAt description avatar')
   .exec();
}

export async function verifyPassword(user, password) {
   return bcrypt.compare(password, user.password);
}

export async function generateVerificationCode(userId) {

   const code = Math.floor(100000 + Math.random() * 900000).toString();
   const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 
  
   await UserModel.findByIdAndUpdate(
       userId,
       {
           verificationCode: {
               code: code,
               expiresAt: expiresAt
           }
       }
   );
  
   return code;
}

export async function verifyCode(userId, code) {
   const user = await UserModel.findById(userId);
   if (!user) {
       return false;
   }
  
   if (!user.verificationCode ||
       user.verificationCode.code !== code ||
       user.verificationCode.expiresAt < new Date()) {
       return false;
   }
  
   return true;
}

export async function addUserEmail(userId, email) {
   return UserModel.findByIdAndUpdate(
       userId,
       {
           email: email,
           emailVerified: false
       },
       { new: true }
   ).exec();
}

export async function verifyUserEmail(userId) {
   return UserModel.findByIdAndUpdate(
       userId,
       { emailVerified: true },
       { new: true }
   ).exec();
}