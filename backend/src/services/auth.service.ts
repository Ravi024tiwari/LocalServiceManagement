import { User, IUser } from '../models/User.model.js';
import { ProviderProfile } from '../models/ProviderProfile.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


interface AuthResponse {
    user: Partial<IUser>;
    token: string;
}

export const registerUser = async (userData: Partial<IUser>): Promise<AuthResponse> => {
    const { name, email, password, phone, role } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password as string, salt);

    // Creates user with optional role (defaults to CUSTOMER if not provided)
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        isOnline: true,
        ...(role && { role }),
    });

    // If registered as a PROVIDER, automatically create their ProviderProfile document
    if (user.role === 'PROVIDER') {
        const existingProfile = await ProviderProfile.findOne({ user_id: user._id });
        if (!existingProfile) {
            await ProviderProfile.create({
                user_id: user._id,
                documents: [],
                verification_status: 'PENDING',
                isApproved: false,
                is_active: true,
                experience_years: 0,
                average_rating: 0,
                total_reviews: 0,
                availability: [
                    { day: 'Monday', start_time: '09:00', end_time: '18:00', is_closed: false },
                    { day: 'Tuesday', start_time: '09:00', end_time: '18:00', is_closed: false },
                    { day: 'Wednesday', start_time: '09:00', end_time: '18:00', is_closed: false },
                    { day: 'Thursday', start_time: '09:00', end_time: '18:00', is_closed: false },
                    { day: 'Friday', start_time: '09:00', end_time: '18:00', is_closed: false },
                    { day: 'Saturday', start_time: '09:00', end_time: '18:00', is_closed: false },
                    { day: 'Sunday', start_time: '09:00', end_time: '18:00', is_closed: true },
                ],
            });
        }
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );

    const { password: _password, ...userWithoutPassword } = user.toObject();

    return { user: userWithoutPassword, token };
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    user.isOnline = true;
    await user.save();

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );

    const { password: _password, ...userWithoutPassword } = user.toObject();

    return { user: userWithoutPassword, token };
};