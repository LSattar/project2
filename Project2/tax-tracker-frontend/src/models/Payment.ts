import { TaxReturn } from "./TaxReturn";

export class Payment {
    id: number;
    amount: number;
    date: Date;
    taxReturn: TaxReturn;
    method: string;

    constructor(id: number, amount: number, date: Date, taxReturn: TaxReturn, method: string){
        this.id = id;
        this.amount = amount;
        this.date = date;
        this.taxReturn = taxReturn;
        this.method = method;
    }
}