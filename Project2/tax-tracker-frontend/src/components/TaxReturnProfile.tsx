import { useState, useEffect } from "react";
import axios from "axios";
import { TaxReturn } from "../models/TaxReturn.ts";
import React from 'react';
import '../css/clientprofile.css';
import { EditTaxReturn } from "./EditTaxReturn.tsx";

interface TaxReturnProfileProps {
    taxReturnId: number;
    onClose: () => void;
    setEditingTaxReturnId: (id: number | null) => void;
}

export const TaxReturnProfile = ({ taxReturnId, onClose }: TaxReturnProfileProps) => {
    const [taxReturn, setTaxReturn] = useState<TaxReturn | null>(null);
    const [isEditing, setIsEditing] = useState(false);
        const [balance, setBalance] = useState<number | null>(null);
    

    console.log("Tax Return profile opened");

    useEffect(() => {
        if (!taxReturnId) return;

        const fetchTaxReturn = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/tax-return/${taxReturnId}`);
                setTaxReturn(response.data);
            } catch (error) {
                console.error("Error fetching tax return details:", error);
            }
        };

        fetchTaxReturn();
    }, [taxReturnId]);

    const updateTaxReturn = async (updatedTaxReturn: TaxReturn): Promise<void> => {
        try {
            await axios.put(`http://localhost:8080/tax-return/${updatedTaxReturn.id}`, updatedTaxReturn);
            setTaxReturn(updatedTaxReturn);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating tax return:", error);
        }
    };

    useEffect(() => {
        const getTaxReturnBalance = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/payment/tax-return/${taxReturnId}/balance`);
                setBalance(response.data); 
            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        };

        if (taxReturn?.id) {
            getTaxReturnBalance();
        }
    }, [taxReturn]);

    if (!taxReturn) return null;

    return (
        <div>
            {isEditing ? (
                <EditTaxReturn taxReturn={taxReturn} updateTaxReturn={updateTaxReturn} onCancel={() => setIsEditing(false)} />
            ) : (
                <>
                    <h2>Tax Return Details</h2>
                    <div className="container">
                        <div className="column">                    <h3>Basic Info</h3>
                            <p><strong>ID: </strong> {taxReturn.id}</p>
                            <p><strong>Year: </strong> {taxReturn.year}</p>
                            <p><strong>Status: </strong> {taxReturn.status}</p>
                            <p><strong>Amount Paid: </strong> ${taxReturn.amountPaid}</p>
                            <p><strong>Amount Owed: </strong> ${taxReturn.amountOwed}</p>
                            <p><strong>Total Income: </strong> ${taxReturn.totalIncome}</p>
                            <p><strong>Adjustments: </strong> ${taxReturn.adjustments}</p>
                            <p><strong>Filing Status: </strong> {taxReturn.filingStatus}</p>
                            <p><strong>Created On: </strong> {new Date(taxReturn.creationDate).toLocaleDateString()}</p>
                            <p><strong>Last Updated: </strong> {new Date(taxReturn.updateDate).toLocaleDateString()}</p>
                            <p><strong>Balance: </strong> ${balance}</p>
                        </div> <div className="column">
                            <h3>Client Information</h3>
                            <p><strong>Name: </strong> {taxReturn.client.firstName} {taxReturn.client.lastName}</p>
                            <p><strong>DOB: </strong> {taxReturn.client.dob ? new Date(taxReturn.client.dob).toLocaleDateString() : "N/A"}</p>
                            <p><strong>SSN: </strong>
                            <span className="ssn-container">
                            <span className="hidden">{taxReturn.client.ssn}</span>
                            <span className="hover"> <img src= "/images/view.png"></img></span>
                        </span>
                            </p>
                            <p><strong>Employment Sector: </strong> {taxReturn.employmentSector ? taxReturn.employmentSector.employmentSectorName : "Not Available"}</p>

                            <h3>CPA Information</h3>
                            <p><strong>CPA Name: </strong> {taxReturn.cpa.firstName} {taxReturn.cpa.lastName}</p>

                        </div>
                    </div>


                    <div className="profile-buttons">
                        <button className="button-update" onClick={() => setIsEditing(true)}> <img className="button-image" src="/images/pencil-white.png" alt="Edit" />Edit</button>
                        <button className="button-save" onClick={onClose}><img className="button-image" src="/images/x.png" alt="Edit" />Close</button>
                        <button className="button-cancel"><img className="button-image" src="/images/trash-can-white.png" alt="Edit" />Delete</button>
                    </div>
                </>
            )}
        </div>
    );
};
