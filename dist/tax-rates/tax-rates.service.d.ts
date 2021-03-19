export declare class TaxRatesService {
    private readonly taxRateModel;
    constructor(taxRateModel: any);
    addTaxRate({ state, postalCode, taxRate }: {
        state: any;
        postalCode: any;
        taxRate: any;
    }): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTaxRateByPostalCode(postalCode: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
