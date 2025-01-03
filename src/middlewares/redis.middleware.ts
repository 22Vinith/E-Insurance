import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';
import HttpStatus from 'http-status-codes';

export const cacheData = async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const basePath = req.baseUrl.split('/').pop(); //only for plan, policy and schemes
    let cacheKey = '';

    try {
        if (basePath === 'plan') {
            cacheKey = `plans:page=${page}:limit=${limit}`;
        } else if (basePath === 'policy') {
            const customerId = req.params.id || res.locals.id; 
            cacheKey = `policies:customer:${customerId}:page=${page}:limit=${limit}`;
        } else if (basePath === 'scheme') {
            cacheKey = `schemes:page=${page}:limit=${limit}`;
        } else {
            return next(); 
        }

        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            return res.status(HttpStatus.OK).json({
                code: HttpStatus.OK,
                data: parsedData.data,
                total: parsedData.total,
                page: parsedData.page,
                totalPages: parsedData.totalPages,
                source: 'Redis Cache',
            });
        }

        next(); 
    } catch (error) {
        next(error);
    }
};