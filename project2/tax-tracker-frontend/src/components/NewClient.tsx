import React from 'react';
import { Client } from '../models/Client';
import { useState, useEffect, useRef } from 'react';
import { EmploymentSector } from '../models/EmploymentSector';
import axios from 'axios';
import { Capitalize } from '../Capitalize';
import '../css/clientprofile.css';

const API_URL = process.env.REACT_APP_URL!;


export const NewClient = ({ addClientToList, onCancel }: { addClientToList: (newClient: any) => void, onCancel: () => void }) => {
    const [employmentSectors, setEmploymentSectors] = useState<EmploymentSector[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [ssnMessage, setSsnMessage] = useState<string | null>(null);

    const addFormFirstName = useRef<HTMLInputElement>(null);
    const addFormLastName = useRef<HTMLInputElement>(null);
    const addFormSsn = useRef<HTMLInputElement>(null);
    const addFormDob = useRef<HTMLInputElement>(null);
    const addFormPhone = useRef<HTMLInputElement>(null);
    const addFormEmail = useRef<HTMLInputElement>(null);
    const addFormAddress1 = useRef<HTMLInputElement>(null);
    const addFormAddress2 = useRef<HTMLInputElement>(null);
    const addFormCity = useRef<HTMLInputElement>(null);
    const addFormState = useRef<HTMLInputElement>(null);
    const addFormZip = useRef<HTMLInputElement>(null);
    const addFormEmploymentSector = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        const fetchEmploymentSectors = async () => {
            try {
                const response = await axios.get(`${API_URL}/employment-sector`);
                setEmploymentSectors(response.data.map((sector: any) =>
                    new EmploymentSector(sector.id, sector.employmentSectorName)
                ));
            } catch (error) {
                console.error("Error fetching employment sectors:", error);
            }
        };

        fetchEmploymentSectors();
        console.log("Opened New Client Form");
    }, []);

    const addClient = async (event: any): Promise<void> => {
        event.preventDefault();
        setSsnMessage(null);

        const enteredSSN = addFormSsn.current?.value;
        if (!enteredSSN) {
            setSsnMessage("SSN is required.");
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/client/by-ssn/${enteredSSN}`);

            if (response.status === 200) {
                const existingClient = response.data;

                if (existingClient.active) {

                    setSsnMessage("Duplicate Social Security Number. Please verify information.");
                    return;
                } else {

                    const confirmReactivation = window.confirm(
                        "A client with this SSN exists but is inactive. Do you want to reactivate their record?"
                    );

                    if (!confirmReactivation) return;

                    await reactivateClient(existingClient.id);
                    return;
                }
            }
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                console.log("No existing client found. Proceeding with new client registration.");
            } else {
                console.error("Error searching for client:", error);
                alert("Error retrieving client. Please try again.");
                return;
            }
        }

        try {
            const selectedSectorId = addFormEmploymentSector.current?.value
                ? Number(addFormEmploymentSector.current.value)
                : null;

            const newClient = {
                firstName: addFormFirstName.current?.value,
                lastName: addFormLastName.current?.value,
                ssn: enteredSSN,
                dob: addFormDob.current?.value ? new Date(addFormDob.current.value) : null,
                phone: addFormPhone.current?.value,
                email: addFormEmail.current?.value,
                address1: addFormAddress1.current?.value,
                address2: addFormAddress2.current?.value,
                city: addFormCity.current?.value,
                state: addFormState.current?.value,
                zip: addFormZip.current?.value,
                employmentSector: selectedSectorId ? { id: selectedSectorId } : null
            };

            const createResponse = await axios.post(`${API_URL}/client`, newClient);

            addClientToList(createResponse.data);
            onCancel();
        } catch (error) {
            console.error("Error adding client:", error);
        }
    };

    const reactivateClient = async (clientId: number) => {
        try {
            const updatedClient = {
                firstName: addFormFirstName.current?.value,
                lastName: addFormLastName.current?.value,
                dob: addFormDob.current?.value ? new Date(addFormDob.current.value) : null,
                ssn: addFormSsn.current?.value,
                phone: addFormPhone.current?.value,
                email: addFormEmail.current?.value,
                address1: addFormAddress1.current?.value,
                address2: addFormAddress2.current?.value,
                city: addFormCity.current?.value,
                state: addFormState.current?.value,
                zip: addFormZip.current?.value,
                employmentSector: addFormEmploymentSector.current?.value
                    ? { id: Number(addFormEmploymentSector.current.value) }
                    : null,
                active: true
            };

            const response = await axios.put(`${API_URL}/client/${clientId}`, updatedClient);

            console.log("Client reactivated:", response.data);
            addClientToList(response.data);
            onCancel();
        } catch (error) {
            console.error("Error reactivating client:", error);
        }
    };


    return (
        <div className="new-client-form">
            <h2>Add Client</h2>
            <form onSubmit={addClient}>
                <div className='container'>
                    <div className='column'>
                    <h3>Basic Info</h3>
                        <label>First Name: <input required type="text" ref={addFormFirstName} /></label>
                        <label>Last Name: <input required type="text" ref={addFormLastName} /></label>
                        <label>DOB: <input required type="date" ref={addFormDob} /></label>
                        <label>SSN: <input required type="text" ref={addFormSsn} /></label>
                        {ssnMessage && <p className='error-message'>{ssnMessage}</p>}
                        <label>Employment Sector:
                            <select ref={addFormEmploymentSector}>
                                <option value="" disabled>Select Employment Sector</option>
                                {employmentSectors.map(sector => (
                                    <option key={sector.id} value={sector.id}>
                                        {sector.employmentSectorName}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className='column'>
                        <h3>Contact Info</h3>
                        <label>Phone: <input required type="text" ref={addFormPhone}size={12} /></label>
                        <label>Email: <input required type="email" ref={addFormEmail} size={12}/></label>
                        <label>Address 1: <input required type="text" ref={addFormAddress1} size={12} /></label>
                        <label>Address 2: <input type="text" ref={addFormAddress2} size={12} /></label>
                        <label>City: <input required type="text" ref={addFormCity} size={12}/></label>
                        <label>State: <input required type="text" ref={addFormState} size={12}/></label>
                        <label>Zip: <input required type="text" ref={addFormZip} size={12}/></label>
                    </div>
                </div>
                {errorMessage && <p>{errorMessage}</p>}
                <div className="profile-buttons">
                    <button type="submit" className="button-save"><img src="/images/check.png"></img>Submit</button>
                    <button type="button" className="button-cancel" onClick={onCancel}><img src="/images/x.png"></img>Cancel</button>
                </div>
            </form>
        </div>
    );
};