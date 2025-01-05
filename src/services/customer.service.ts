import { Customer } from '../interfaces/customer.interface';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongoose';
import customer from '../models/customer.model'
import Policy from '../models/policy.model';
import Consultant from '../models/consultant.model'
import { sendEmail } from '../utils/user.util';
import { error } from 'winston';
import redisClient from '../config/redis';



class CustomerService {
  public createCustomer = async (body: Customer): Promise<Customer> => {
    try {
      const agents = await Consultant.find({ region: body.region }).sort({ num_of_customers: 1 }).exec();
      if (agents.length === 0) {
        throw new Error('No agent available in this region');
      }
      const assignedAgent = agents[0] ;
      const existingCustomer = await customer.findOne({ email: body.email });
      if (existingCustomer) {
        throw new Error('Customer with this email already exists.');
      }

      const hashedPassword = await bcrypt.hash(body.password, 10);
      body.password = hashedPassword;
      body.agentId = assignedAgent ? assignedAgent._id : null;

      const newCustomer = await customer.create(body);

      if (assignedAgent) {
        await Consultant.updateOne({ _id: assignedAgent._id }, { $inc: { num_of_customers: 1 } });
      }

      // Invalidate the cache for the agent's customers
      const cacheKey = `customers:agent:${assignedAgent._id}`;
      await redisClient.del(cacheKey);  // Remove the cache for this agent

      return newCustomer;
    } catch (error) {
      throw new Error(`Error creating customer: ${error.message}`);
    }
   };

  // customer login
  public customerLogin = async (body: Customer): Promise<any> => {
    const customerData = await customer.findOne({ email: body.email });
    if (!customerData) {
      throw new Error('Customer not found');
    }

    const isMatch = await bcrypt.compare(body.password, customerData.password);
    if (!isMatch) {
      throw new Error('Invalid password');
    }

    const payload = { userId: customerData._id, email: customerData.email };


    const token = jwt.sign(payload, process.env.JWT_CUSTOMER_SECRET as string, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, process.env.JWT_CUSTOMER_SECRET as string, { expiresIn: '7d' });

    await customer.findOneAndUpdate({ _id: customerData._id }, { refreshToken });

    return { token, refreshToken, username: customerData.username };
  };

  //get all customers
  public getAllCustomers = async (agentId: ObjectId): Promise<{data: Customer[], source: string}> => {
    try {
        // Create a cache key based on the agentId
        const cacheKey = `customers:agent:${agentId}`;

        // Check if the data is already cached in Redis
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return {
                data: JSON.parse(cachedData),
                source: 'Redis Cache',
            };
        }

        // If no cached data, fetch from the database
        const customers = await customer.find({ agentId }).select('-password -refreshToken');
        if (!customers || customers.length === 0) {
            throw new Error('No customers found for this agent.');
        }

        // Cache the data for 60 seconds
        await redisClient.setEx(cacheKey, 60, JSON.stringify(customers));

        return {
            data: customers,
            source: 'Database',
        };
    } catch (error) {
        throw new Error(`Error retrieving customers: ${error.message}`);
    }
  };
   
  //get customer by Id 
  public getCustomerById=async(customerId:string):Promise<any> =>{
    try {
      const res = await customer.findById(customerId);
      if(!res) {
        throw new Error('customer not found');
      }
      return res;
    } catch (error) {
      throw error;
    }
  };

  //refresh token
  public refreshToken = async (customerId: string): Promise<string> => {
    try {
      const customerRecord = await customer.findById(customerId);
      const refreshToken = customerRecord?.refreshToken;
      if (!refreshToken) {
        throw new Error('Refresh token is missing');
      }
      const payload : any= jwt.verify(refreshToken, process.env.JWT_CUSTOMER_SECRET );
      const { userId, email } = payload;
      const newAccessToken = jwt.sign({ userId, email }, process.env.JWT_CUSTOMER_SECRET, { expiresIn: '1h' });
      return newAccessToken;
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  };


  
  // forget password
  public forgotPassword = async (email: string): Promise<void> => {
    try{
      const customerData = await customer.findOne({ email });
      if (!customerData) {
        throw new Error('Email not found');
      }
      const token = jwt.sign({ userId: customerData._id }, process.env.JWT_CUSTOMER_RESET_SECRET, { expiresIn: '1h' });
      await sendEmail(email, token);
    } catch(error){
      throw new Error("Error occured cannot send email: "+error)
    }
  };

  public payPremium = async (body): Promise<any> => {
    const { policyId, paymentAmount, agentId, commissionRate = 5 } = body;
    const policy = await Policy.findById(policyId);

    if(policy.duration===policy.premiumPaid){
       throw new Error(`your policy is matured don't need to pay`)
    }
    const amountPerMonth = policy.premiumAmount;
    if (paymentAmount !== amountPerMonth) {
      throw new Error(`Payment amount must match the monthly premium of ${amountPerMonth}`);
    }
    policy.premiumPaid += 1;
    policy.pendingPremium = Math.max(0, policy.pendingPremium - 1);
    await policy.save();
    const commissionEarned = paymentAmount * (commissionRate / 100);
    if (agentId) {
      await Consultant.findByIdAndUpdate(agentId,{ $inc: { commission: commissionEarned } }, { new: true } );
    }
      await redisClient.flushAll();
    return { totalMonthsPaid: policy.premiumPaid,monthsRemaining: policy.pendingPremium};
  };

  //reset password
  public resetPassword = async (body: any, userId: string): Promise<void> => {
    try{
      const customerData = await customer.findById(userId);
      if (!customerData) {
        throw new Error('User not found');
      }
      const hashedPassword = await bcrypt.hash(body.newPassword, 10);
      customerData.password = hashedPassword;
      await customerData.save();
    } catch (error) {
      throw new Error(`Error resetting password: ${error.message}`);
    }
};
      
}

export default CustomerService;