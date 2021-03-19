import { CreateContactCollegeCategoryDto } from './dto/create-contact-college-category.dto';
import { ContactCollegeCategoriesService } from './contact-college-categories.service';
import { ListDto } from '../common/dto/list.dto';
import { GetAllCategoriesDto } from './dto/get-all-categories.dto';
import { ContactCollegeCategoryIdDto } from '../common/dto/contactCollegeCategoryId.dto';
export declare class ContactCollegeCategoriesController {
    private readonly contactCollegeCategoriesService;
    constructor(contactCollegeCategoriesService: ContactCollegeCategoriesService);
    createCategory(createContactCollegeCategoryDto: CreateContactCollegeCategoryDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCategories(listDto: ListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAllCategories(listDto: GetAllCategoriesDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    disableCategory(categoryIdDto: ContactCollegeCategoryIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    enableCategory(categoryIdDto: ContactCollegeCategoryIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
