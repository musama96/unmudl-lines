declare const _default: {
    success(data?: any, message?: string, status?: number): {
        success: boolean;
        status: number;
        data: any;
        message: string;
    };
    fail(message?: string, error?: any, status?: number): never;
};
export default _default;
export interface SuccessInterface {
    success: boolean;
    status: number;
    data: any;
    message: string;
}
