import { IPolicy } from '../interfaces/policy.interface';
import Consultant from '../models/consultant.model'
import policyModel from '../models/policy.model';
import redisClient from '../config/redis';

 class PolicyService{
   // Create the policy
  public createPolicy = async (policyData: IPolicy): Promise<any> => {
    try {
        const createdPolicy = await policyModel.create(policyData);
        await Consultant.updateOne( { _id: policyData.agentId }, { $inc: { num_of_policies: 1 } } );
        await redisClient.del(`policies:customer:${policyData.customerId}:all`);
        return createdPolicy;
      } catch (error) {
        throw new Error(`Failed to create policy: ${error.message}`);
      }
    };

    public getAllPolicies = async (customerId: string, page: number, limit: number): Promise<{ data: IPolicy[]; total: number; page: number; totalPages: number; source: string }> => {
      const cacheKey = `policies:customer:${customerId}:page=${page}:limit=${limit}`;

      try {
          // Fetch data from the database
          const total = await policyModel.countDocuments({ customerId });
          const policies = await policyModel
            .find({ customerId })
            .skip((page - 1) * limit)
            .limit(limit);
        
          if(!policies || policies.length === 0) {
            throw new Error('No policy found');
          }
          const totalPages = Math.ceil(total / limit);
          // Cache the data for 60 seconds
          const cacheData = { data: policies, total, page, totalPages };
          await redisClient.setEx(cacheKey, 60, JSON.stringify(cacheData));

          return {
              ...cacheData,
              source: 'Database', // Indicate data is from the database
          };
      } catch (error) {
          throw new Error(`Error fetching policy: ${error.message}`);
      }
    };

    public getAllAgentPolicies = async (agentId: string): Promise<any> => {
      const cacheKey = `policies:agent:${agentId}`;

      try {
          // Fetch data from the database
          const policies = await policyModel.find({ agentId })            
        
          if(!policies || policies.length === 0) {
            throw new Error('No policy found');
          }
          // Cache the data for 60 seconds
          const cacheData = { data: policies };
          await redisClient.setEx(cacheKey, 600, JSON.stringify(cacheData));

          return {
              ...cacheData,
              source: 'Database', // Indicate data is from the database
          };
      } catch (error) {
          throw new Error(`Error fetching policy: ${error.message}`);
      }
    };

    public updateStatus = async (id: string, status: string ): Promise<any> => {
      const doc: IPolicy = await policyModel.findOne({_id: id});
          return {data: await policyModel.findByIdAndUpdate(id, {status: status}, {new: true}),
                  message: "Status updated successfully"
              }  
  }

    public getPolicyById = async (id: string): Promise<any> => {
      try {
          const policy = await policyModel.findById(id);
          if (!policy) {
            throw new Error('Policy not found');
          }
          return policy;
        } catch (error) {
          throw new Error(`Error fetching policy by ID: ${error.message}`);
        }
    };

    public updatePolicy = async (id: string, updateData: Partial<IPolicy>): Promise<any> => {
      try {
          const updatedPolicy = await policyModel.findByIdAndUpdate(id, updateData, { new: true });
          if (!updatedPolicy) {
            throw new Error('Policy not found');
          }

          // Invalidate the cache for the updated policy
          const customerId = updatedPolicy.customerId;
          await redisClient.del(`policies:customer:${customerId}:all`);

          return updatedPolicy;
        } catch (error) {
          throw new Error(`Error updating policy: ${error.message}`);
        }
    };

    public deletePolicy = async (id: string): Promise<any> => {
      try {
          const deletedPolicy = await policyModel.findByIdAndDelete(id);
          if (!deletedPolicy) {
            throw new Error('Policy not found');
          }

          // Invalidate the cache for the customer
          const customerId = deletedPolicy.customerId;
          await redisClient.del(`policies:customer:${customerId}:all`);

          return deletedPolicy;
        } catch (error) {
          throw new Error(`Error deleting scheme: ${error.message}`);
        }
    };
  }
   
 export default PolicyService;