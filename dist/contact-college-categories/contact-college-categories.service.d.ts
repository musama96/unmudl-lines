import { CreateContactCollegeCategoryDto } from './dto/create-contact-college-category.dto';
import { GetAllCategoriesDto } from './dto/get-all-categories.dto';
import { ListDto } from '../common/dto/list.dto';
export declare class ContactCollegeCategoriesService {
    private readonly contactCollegeCategoryModel;
    constructor(contactCollegeCategoryModel: any);
    createCategory(category: CreateContactCollegeCategoryDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAllCategories(params: GetAllCategoriesDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCategories(params: ListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    disableCategory(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    enableCategory(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
