import { EmploymentSector } from "./EmploymentSector";

export class Client {
    id: number;
    firstName: string;
    lastName: string;
    ssn: string;
    hashed_ssn: string;
    dob: Date;
    phone: string;
    email: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    employmentSector: EmploymentSector

    constructor(
        id: number,
        firstName: string,
        lastName: string,
        ssn: string,
        hashed_ssn: string,
        dob: Date,
        phone: string,
        email: string,
        address1: string,
        address2: string,
        city: string,
        state: string,
        zip: string,
        employmentSector: EmploymentSector
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.ssn = ssn;
        this.hashed_ssn = hashed_ssn;
        this.dob = dob;
        this.phone = phone;
        this.email = email;
        this.address1 = address1;
        this.address2 = address2;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.employmentSector = employmentSector;
    }
}
