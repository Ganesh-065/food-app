import mongoose, { Document, Schema, Types } from 'mongoose';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: string;
}

const userSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: String,
  role: { type: String, default: 'user' },
});

export default mongoose.model<UserDocument>('User', userSchema);
