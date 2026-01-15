import mongoose, { Schema, Document } from "mongoose";

export interface IProfile {
    name: string;
    color: string;
    avatar?: string;
    age: number;
    isKidsMode: boolean;
    watchlist: number[]; // Array of TMDB movie IDs
    history: number[];   // Array of TMDB movie IDs
    preferredLanguage: string;
}

export interface IUser extends Document {
    email: string;
    password: string;
    profiles: IProfile[];
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
}

const ProfileSchema = new Schema<IProfile>({
    name: { type: String, required: true },
    color: { type: String, required: true },
    avatar: { type: String },
    age: { type: Number, default: 18 },
    isKidsMode: { type: Boolean, default: false },
    watchlist: [{ type: Number }],
    history: [{ type: Number }],
    preferredLanguage: { type: String, default: "en-US" }
});

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profiles: [ProfileSchema],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>("User", UserSchema);
