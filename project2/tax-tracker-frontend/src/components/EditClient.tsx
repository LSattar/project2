import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Client } from "../models/Client.ts";
import React from 'react';
import '../css/clientprofile.css'
import { EmploymentSector } from "../models/EmploymentSector.ts";

interface EditClientProps {
    client: Client;
    updateClient: (client: Client) => Promise<void>;
    onCancel: () => void;
}

export const EditClient = ({ client, updateClient, onCancel }: EditClientProps) => {

    const [employmentSectors, setEmploymentSectors] = useState<EmploymentSector[]>([]);

    const editFormFirstName = useRef<HTMLInputElement>(null);
    const editFormLastName = useRef<HTMLInputElement>(null);
    const editFormSsn = useRef<HTMLInputElement>(null);
    const editFormDob = useRef<HTMLInputElement>(null);
    const editFormPhone = useRef<HTMLInputElement>(null);
    const editFormEmail = useRef<HTMLInputElement>(null);
    const editFormAddress1 = useRef<HTMLInputElement>(null);
    const editFormAddress2 = useRef<HTMLInputElement>(null);
    const editFormCity = useRef<HTMLInputElement>(null);
    const editFormState = useRef<HTMLInputElement>(null);
    const editFormZip = useRef<HTMLInputElement>(null);
    const editFormEmploymentSector = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        const fetchEmploymentSectors = async () => {
            try {
                const response = await axios.get("http://localhost:8080/employment-sector");
                setEmploymentSectors(response.data.map((sector: any) =>
                    new EmploymentSector(sector.id, sector.employmentSectorName)
                ));
            } catch (error) {
                console.error("Error fetching employment sectors:", error);
            }
        };

        fetchEmploymentSectors();
        console.log("opened");
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        console.log("adding client");
        event.preventDefault();

        const dob: Date = new Date(Date.parse(editFormDob.current?.value ?? ''));

        const updatedClient = new Client(
            client.id,
            editFormFirstName.current?.value || client.firstName,
            editFormLastName.current?.value || client.lastName,
            editFormSsn.current?.value || client.ssn,
            client.hashed_ssn,
            dob,
            editFormPhone.current?.value || client.phone,
            editFormEmail.current?.value || client.email,
            editFormAddress1.current?.value || client.address1,
            editFormAddress2.current?.value || client.address2,
            editFormCity.current?.value || client.city,
            editFormState.current?.value || client.state,
            editFormZip.current?.value || client.zip,
            client.employmentSector
        );

        await updateClient(updatedClient);
    };

    return (
        <div className="edit-client-form">
                <h2>Edit Client</h2>
                <h3>Basic Info</h3>
                <form onSubmit={handleSubmit}>
                    <label>First Name: <input ref={editFormFirstName} defaultValue={client.firstName} /></label>
                    <label>Last Name: <input ref={editFormLastName} defaultValue={client.lastName} /></label>
                    <label>DOB: <input type="date" ref={editFormDob} defaultValue={client.dob.toString()} /></label>
                    <label>SSN: <input ref={editFormSsn} defaultValue={client.ssn} /></label>
                    <label>Employment Sector:&nbsp;
                        <select ref={editFormEmploymentSector} defaultValue={client.employmentSector?.id || ""}>
                            <option value="" disabled>Select Employment Sector</option>
                            {employmentSectors.map(sector => (
                                <option key={sector.id} value={sector.id}>
                                    {sector.employmentSectorName}
                                </option>
                            ))}
                        </select>
                    </label>
                    <h3>Contact Info</h3>
                    <label>Phone: <input ref={editFormPhone} defaultValue={client.phone} /></label>
                    <label>Email: <input ref={editFormEmail} defaultValue={client.email} /></label>
                    <label>Address 1: <input ref={editFormAddress1} defaultValue={client.address1} /></label>
                    <label>Address 2: <input ref={editFormAddress2} defaultValue={client.address2} /></label>
                    <label>City: <input ref={editFormCity} defaultValue={client.city} /></label>
                    <label>State: <input ref={editFormState} defaultValue={client.state} /></label>
                    <label>Zip: <input ref={editFormZip} defaultValue={client.zip} /></label>

                    <div className="profile-buttons">
                        <button type="submit" className="button-save"><img src="/images/check.png"></img>Save</button>
                        <button type="button" className="button-cancel" onClick={onCancel}><img src="/images/x.png"></img>Cancel</button>
                    </div>
                </form>
            </div>
    );
};


