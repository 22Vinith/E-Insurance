import Plan from '../models/plan.model';
import { IPlan } from '../interfaces/plan.interface';
import redisClient from '../config/redis';

class PlanService {

    // Create a new plan
    public createPlan = async (body: IPlan): Promise<IPlan> => {
        try {
            const res = await Plan.create(body);

            // Invalidate cache for "all plans"
            await redisClient.flushAll();

            return res;
        } catch (error) {
            throw new Error('Error creating plan');
        }
    };

    // Get a specific plan by ID
    public getPlanById = async (planId: string): Promise<IPlan | null> => {
        try {
            const res = await Plan.findById(planId);
            if(!res) {
                throw new Error('Plan not found');
            }
            return res;
        } catch (error) {
            throw error;
        }
    };

    // Get all plans
    public getAllPlans = async (page: number, limit: number): Promise<{ data: IPlan[]; total: number; page: number; totalPages: number; source: string }> => {
        const cacheKey = `plans:page=${page}:limit=${limit}`;
    
        try {
            const total = await Plan.countDocuments();
            const totalPages = Math.ceil(total / limit);
            const data = await Plan.find()
                .skip((page - 1) * limit)
                .limit(limit);
    
            // Cache the data for 60 seconds
            await redisClient.setEx(cacheKey, 60, JSON.stringify({ data, total, page, totalPages }));
    
            return {
                data,
                total,
                page,
                totalPages,
                source: 'Database', // Indicate data is from the database
            };
        } catch (error) {
            throw error;
        }
    };
    
    // Update a plan by ID
    public updatePlan = async (planId: string, updatedData: Partial<IPlan>): Promise<IPlan | null> => {
        try {
            const res = await Plan.findByIdAndUpdate(planId, updatedData, { new: true });
            if (!res) {
                throw new Error('Plan not found'); 
            }

            // Invalidate cache for this specific plan and all plans
            await redisClient.del(`plans:${planId}`);
            await redisClient.del('plans:all');

            return res;
        } catch (error) {
            throw error;
        }
    };


    // Delete a plan by ID
    public deletePlan = async (planId: string): Promise<boolean> => {
        try {
            const res = await Plan.findById(planId);
            if (!res) {
                throw new Error('Plan not found');
            }
            await Plan.findByIdAndDelete(planId);

             // Invalidate cache for this specific plan and all plans
             await redisClient.del(`plans:${planId}`);
             await redisClient.del('plans:all');

            return true;
        } catch (error) {
            throw error;
        }
    };

}

export default PlanService;