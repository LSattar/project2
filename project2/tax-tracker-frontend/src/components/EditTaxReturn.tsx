import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { TaxReturn } from "../models/TaxReturn";
import React from 'react';
import '../css/clientprofile.css';
import { EmploymentSector } from "../models/EmploymentSector";
import { Cpa } from "../models/Cpa";

const API_URL = process.env.REACT_APP_URL!;


interface EditTaxReturnProps {
    taxReturn: TaxReturn;
    updateTaxReturn: (taxReturn: TaxReturn) => Promise<void>;
    onCancel: () => void;
}

export const EditTaxReturn = ({ taxReturn, updateTaxReturn, onCancel }: EditTaxReturnProps) => {

    const [employmentSectors, setEmploymentSectors] = useState<EmploymentSector[]>([]);
    const [cpas, setCpas] = useState<Cpa[]>([]);
    const editFormYear = useRef<HTMLInputElement>(null);
    const editFormStatus = useRef<HTMLInputElement>(null);
    const editFormAmountPaid = useRef<HTMLInputElement>(null);
    const editFormAmountOwed = useRef<HTMLInputElement>(null);
    const editFormTotalIncome = useRef<HTMLInputElement>(null);
    const editFormAdjustments = useRef<HTMLInputElement>(null);
    const editFormFilingStatus = useRef<HTMLInputElement>(null);
    const editFormEmploymentSector = useRef<HTMLSelectElement>(null);
    const editFormCpa = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        const fetchCpas = async () => {
            try {
                const response = await axios.get(`${API_URL}/cpa`);
                setCpas(response.data.map((cpa: any) =>
                    new Cpa(
                        cpa.id,
                        cpa.firstName,
                        cpa.lastName,
                        cpa.license,
                        cpa.phone,
                        cpa.address1,
                        cpa.address2,
                        cpa.city,
                        cpa.state,
                        cpa.zip
                    )
                ));
            } catch (error) {
                console.error("Error fetching employment sectors:", error);
            }
        };

        fetchCpas();
        console.log("CPA's retrieved");
    }, []);


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
        console.log("Employment sectors retrieved");
    }, []);

    useEffect(() => {
        console.log("Editing Tax Return");
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log("submitting tax return edits");
    
        const updatedTaxReturn = new TaxReturn(
            taxReturn.id,
            taxReturn.client,
            cpas.find(cpa => cpa.id === Number(editFormCpa.current?.value)) || taxReturn.cpa, 
            Number(editFormYear.current?.value) || taxReturn.year,
            editFormStatus.current?.value || taxReturn.status,
            Number(editFormAmountPaid.current?.value) || taxReturn.amountPaid, 
            Number(editFormAmountOwed.current?.value) || taxReturn.amountOwed, 
            taxReturn.cost,
            taxReturn.creationDate,
            new Date(),
            employmentSectors.find(sector => sector.id === Number(editFormEmploymentSector.current?.value)) || taxReturn.employmentSector, 
            Number(editFormTotalIncome.current?.value) || taxReturn.totalIncome, 
            Number(editFormAdjustments.current?.value) || taxReturn.adjustments, 
            editFormFilingStatus.current?.value || taxReturn.filingStatus
        );
    
        try {
            console.log("Sending update request to server:", updatedTaxReturn);
            const response = await axios.put(`${API_URL}/tax-return/${taxReturn.id}`, updatedTaxReturn);
            console.log("Response from server:", response.data);
    
            await updateTaxReturn(updatedTaxReturn);
            onCancel(); 
        } catch (error) {
            console.error("Error updating tax return:", error);
        }
    };

    return (
        <div>
            <h2>Edit Tax Return</h2>
            <h3>Basic Info</h3>
            <form onSubmit={handleSubmit}>
                <label>Year: <input ref={editFormYear} defaultValue={taxReturn.year.toString()} /></label>
                <label>Status: <input ref={editFormStatus} defaultValue={taxReturn.status} /></label>
                <label>Amount Paid: <input type="number" ref={editFormAmountPaid} defaultValue={taxReturn.amountPaid.toString()} /></label>
                <label>Amount Owed: <input type="number" ref={editFormAmountOwed} defaultValue={taxReturn.amountOwed.toString()} /></label>
                <label>Total Income: <input type="number" ref={editFormTotalIncome} defaultValue={taxReturn.totalIncome.toString()} /></label>
                <label>Adjustments: <input type="number" ref={editFormAdjustments} defaultValue={taxReturn.adjustments.toString()} /></label>
                <label>Filing Status: <input ref={editFormFilingStatus} defaultValue={taxReturn.filingStatus} /></label>
                <label>Employment Sector:&nbsp;
                    <select ref={editFormEmploymentSector} defaultValue={taxReturn.employmentSector?.id || ""}>
                        <option value="" disabled>Select Employment Sector</option>
                        {employmentSectors.map(sector => (
                            <option key={sector.id} value={sector.id}>
                                {sector.employmentSectorName}
                            </option>
                        ))}
                    </select>
                </label>
                <label>Assigned CPA:&nbsp;
                    <select ref={editFormCpa} defaultValue={taxReturn.cpa?.id || ""}>
                        <option value="" disabled>Select CPA</option>
                        {cpas.map(cpa => (
                            <option key={cpa.id} value={cpa.id}>
                                {cpa.firstName} {cpa.lastName}
                            </option>
                        ))}
                    </select>
                </label>
                <div className="profile-buttons">
                <button type="submit" className="button-save"><img src="/images/check.png"></img>Submit</button>
                <button type="button" className= "button-cancel" onClick={onCancel}><img src= "/images/no.png"></img>Cancel</button>
                </div>
            </form>
        </div>
    );
};