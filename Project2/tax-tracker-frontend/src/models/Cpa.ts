export class Cpa {
    id: number;
    firstName: string;
    lastName: string;
    license: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;

    constructor(
        id: number,
        firstName: string,
        lastName: string,
        license: string,
        phone: string,
        address1: string,
        address2: string,
        city: string,
        state: string,
        zip: string
    ){
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.license = license;
        this.phone = phone;
        this.address1 = address1;
        this.address2 = address2;
        this.city = city;
        this.state = state;
        this.zip = zip;
    }
}