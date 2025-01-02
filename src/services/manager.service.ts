import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import manager from '../models/manager.model';
import { Imanager } from '../interfaces/manager.interface';
import { sendEmail } from '../utils/manager.util';
import redisClient from '../config/redis';

class managerService {
    // Register a new admin
    public createManager = async (body: Imanager): Promise<any> => {
        try {
            const existingAdmin = await manager.findOne({ email: body.email });
            if (existingAdmin) {
                throw new Error('Admin already exists');
            }

            const hashedPassword = await bcrypt.hash(body.password, 10);
            body.password = hashedPassword;
            await manager.create(body);

            // Invalidate cache for admin list
            await redisClient.del('admins:all');

            return 'Admin registerd successfully';
        } catch (error) {
            throw new Error(error.message);
        }
    };

    // Admin login
    public loginManager = async (body: Imanager): Promise<any> => {
        try {
            const adminData = await manager.findOne({ email: body.email });
            if (!adminData) {
                throw new Error('Admin not found');
            }

            const isMatch = await bcrypt.compare(body.password, adminData.password);
            if (!isMatch) {
                throw new Error('Invalid password');
            }

            const payload = { userId: adminData._id, email: adminData.email };
            const token = jwt.sign(payload, process.env.JWT_MANAGER_SECRET);
            console.log(process.env.JWT_MANAGER_SECRET)
            const refreshToken = jwt.sign(payload, process.env.JWT_MANAGER_SECRET, { expiresIn: '7d' });
            await manager.findByIdAndUpdate(adminData._id, { refreshToken });
            return {token, username:adminData.username, email:adminData.email};
        } catch (error) {
            throw new Error(error.message);
        }
    };


    //refresh token
    public refreshToken = async (adminId: string): Promise<any> => {
        try {
            const adminData = await manager.findById(adminId);
            const refreshToken=adminData.refreshToken
            if (!refreshToken) {
                throw new Error('Refresh token is missing');
            }
            const payload : any= jwt.verify(refreshToken, process.env.JWT_MANAGER_SECRET );
            const { userId, email } = payload;
            const newAccessToken = jwt.sign({ userId, email }, process.env.JWT_MANAGER_SECRET, { expiresIn: '1h' });
            return newAccessToken;
        } catch (error) {
            throw new Error(`Error: ${error.message}`);
        }
    };


    // forget password
    public forgotPassword = async (email: string): Promise<void> => {
        try{
        const adminData = await manager.findOne({ email });
        if (!adminData) {
            throw new Error('Email not found');
        }
        const token = jwt.sign({ userId: adminData._id }, process.env.JWT_MANAGER_RESET_SECRET, { expiresIn: '1h' });
        await sendEmail(email, token);
        } catch(error){
            throw new Error("Error occured cannot send email: "+error)
        }
    };

    //reset password
    public resetPassword = async (body: any, userId: string): Promise<void> => {
        try {
            const adminData = await manager.findById(userId);
            if (!adminData) {
                throw new Error('User not found');
            }
            const hashedPassword = await bcrypt.hash(body.newPassword, 10);
            adminData.password = hashedPassword;
            await adminData.save();
        } catch (error) {
            throw new Error(`Error resetting password: ${error.message}`);
        }
    };
}

export default managerService;