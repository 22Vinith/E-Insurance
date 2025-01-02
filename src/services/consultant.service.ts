import bcrypt from 'bcrypt';
import { IConsultant } from "../interfaces/consultant.interface"
import Consultant from "../models/consultant.model"
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/user.util';
import redisClient from '../config/redis';

class consultantService{

    //consultant register
    public signup = async (body: IConsultant): Promise<any> => {
        try{
            const res = await Consultant.findOne({email: body.email});
            if(!res){
                try{
                    body.password = await bcrypt.hash(body.password, 10);
                }catch(err){
                    throw new Error("Error occured in hash: "+err);
                }
                await Consultant.create(body)

                // Invalidate cache for all agents
                await redisClient.del('agents:all');

                return "Agent created successfully"
            }
            else
                throw new Error("User already exist")
        } catch(error){
            throw new Error(error.message)
        }
        
    } 


//consultant login
    public signin = async (body): Promise<any> => {
        const res = await Consultant.findOne({email: body.email});
    if (!res) {
      throw new Error("Invalid email"); 
    }
    const match = await bcrypt.compare(body.password, res.password);
    if(match){
      const payload = { userId: res._id, email: res.email };
      const token = jwt.sign({ userId: res._id, email: res.email }, process.env.JWT_CONSULTANT_SECRET);
      const refreshToken = jwt.sign(payload, process.env.JWT_CONSULTANT_SECRET, { expiresIn: '7d' });
      await Consultant.findByIdAndUpdate(res._id, { refreshToken });

      return {
        message: "Login Successful",
        username: res.username,
        token: token,
      }   
    }
    else{
      throw new Error("Incorrect password");
    }
    }


        // Get all consultants
        public getAllConsultants = async (): Promise<{data: IConsultant[]; source: string}> => {
            try {
                const cachedData = await redisClient.get('agents:all'); 
                if (cachedData) {
                  return {
                    data: JSON.parse(cachedData),
                    source: 'Redis Cache',
                  };
                }
                const res = await Consultant.find().select('-password -refreshToken');
                if(!res || res.length === 0) {
                    throw new Error('No plans found');
                }
                // Cache the consultants data for 60 seconds
                await redisClient.setEx('agents:all', 60, JSON.stringify(res));
    
                return {
                  data: res,
                  source: 'Database'
                };
            } catch (error) {
                throw error;
            }
        };
    
        
    //refresh token
    public refreshToken = async (agentId: string): Promise<any> => {
      try {
        const agentRecord=await Consultant.findById(agentId);
        const refreshToken=agentRecord.refreshToken;
        if (!refreshToken) {
          throw new Error('Refresh token is missing');
        }
        const payload : any= jwt.verify(refreshToken, process.env.JWT_CONSULTANT_SECRET );
        const { userId, email } = payload;
        const newAccessToken = jwt.sign({ userId, email }, process.env.JWT_CONSULTANT_SECRET, { expiresIn: '1h' });
        return newAccessToken;
      } catch (error) {
        throw new Error(`Error: ${error.message}`);  
      } 
    };

    // forget password
    public forgotPassword = async (email: string): Promise<void> => {
      try{
        const agentData = await Consultant.findOne({ email });
        if (!agentData) {
          throw new Error('Email not found');
        }
        const token = jwt.sign({ userId: agentData._id }, process.env.JWT_CONSULTANT_RESET_SECRET, { expiresIn: '1h' });
        await sendEmail(email, token);
      } catch(error){
        throw new Error("Error occured cannot send email: "+error)
      }
    };
  
    //reset password
    public resetPassword = async (body: any, userId:any): Promise<void> => {
      try {
          const agentData = await Consultant.findById(userId);
          if (!agentData) {
              throw new Error('User not found');
          }

          const hashedPassword = await bcrypt.hash(body.newPassword, 10);
          agentData.password = hashedPassword;
          await agentData.save();

      } catch (error) {
          throw new Error(`Error resetting password: ${error.message}`);
      }
    };
    
        
}

export default consultantService