export declare class LocationsService {
    private readonly statesModel;
    private readonly countriesModel;
    constructor(statesModel: any, countriesModel: any);
    getStates(keyword: any): Promise<any>;
    getContries(keyword: any): Promise<any>;
    createState(state: any): Promise<any>;
    createCountry(country: any): Promise<any>;
}
