import { Response, NextFunction, Request } from 'express';
import PolicyService from '../services/policy.service';
import HttpStatus from 'http-status-codes';

class PolicyController {
    private policyService = new PolicyService();

    // Create a new policy
    public createPolicy = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Extract individual files from the request
            const policyApplication = req.files['policyApplication']?.[0];
            const idProof = req.files['idproof']?.[0];
            const ageProof = req.files['ageproof']?.[0];
            const incomeProof = req.files['incomeproof']?.[0];
            const photograph = req.files['photograph']?.[0];

            // Validate required files
            if (!policyApplication) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    code: HttpStatus.BAD_REQUEST,
                    message: 'Policy application file is required.',
                });
            }

            // Prepare uploaded files data
            const uploadedFiles = {
                policyApplication: policyApplication.buffer || null,
                idProof: idProof?.buffer || null,
                ageProof: ageProof?.buffer || null,
                incomeProof: incomeProof?.buffer || null,
                photograph: photograph?.buffer || null,
            };

            // Merge uploaded files with the request body
            req.body = { ...req.body, ...uploadedFiles };

            // Log the request for debugging
            console.log('Request body:', req.body);

            // Call the policy service to create a policy
            const policy = await this.policyService.createPolicy(req.body);

            // Respond with success
            res.status(HttpStatus.CREATED).json({
                code: HttpStatus.CREATED,
                message: 'Policy created successfully',
                data: policy,
            });
        } catch (error) {
            console.error('Error creating policy:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Error creating policy: ${error.message}`,
            });
        }
    };

    // Get all policies for a customer
    public getAllPolicies = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page, limit } = req.query as unknown as { page: number; limit: number };
            const customerId = req.params.id || res.locals.id; // Use customer ID from params or middleware

            const policies = await this.policyService.getAllPolicies(customerId, page, limit);

            res.status(HttpStatus.OK).json({
                code: HttpStatus.OK,
                data: policies.data,
                total: policies.total,
                page: policies.page,
                totalPages: policies.totalPages,
                source: policies.source,
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: `${error}`,
            });
        }
    };

    // Get all policies for an agent
    public getAllAgentPolicies = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const agentId = res.locals.id; // Agent ID from middleware

            const policies = await this.policyService.getAllAgentPolicies(agentId);

            res.status(HttpStatus.OK).json({
                code: HttpStatus.OK,
                data: policies.data,
                source: policies.source,
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: `${error}`,
            });
        }
    };

    // Update the status of a policy
    public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const updatedPolicy = await this.policyService.updateStatus(id, status);

            res.status(HttpStatus.CREATED).json({
                code: HttpStatus.CREATED,
                data: updatedPolicy,
            });
        } catch (error) {
            next(error);
        }
    };

    // Get a single policy by ID
    public getPolicyById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const policy = await this.policyService.getPolicyById(req.params.id);

            res.status(HttpStatus.OK).json({
                code: HttpStatus.OK,
                data: policy,
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: `${error}`,
            });
        }
    };

    // Update a policy
    public updatePolicy = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const policy = await this.policyService.updatePolicy(req.params.id, req.body);

            res.status(HttpStatus.OK).json({
                code: HttpStatus.OK,
                message: 'Policy updated successfully',
                data: policy,
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: `${error}`,
            });
        }
    };

    // Delete a policy
    public deletePolicy = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.policyService.deletePolicy(req.params.id);

            res.status(HttpStatus.OK).json({
                code: HttpStatus.OK,
                message: 'Policy deleted successfully',
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: `${error}`,
            });
        }
    };
}

export default PolicyController;
