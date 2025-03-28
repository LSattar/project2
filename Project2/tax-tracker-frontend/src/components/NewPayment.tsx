import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { TaxReturn } from '../models/TaxReturn.ts';
import axios from 'axios';
import '../css/clientprofile.css';
import { Payment } from '../models/Payment.ts';

export const NewPayment = ({ addPaymentToList, onCancel }: { addPaymentToList: (newPayment: any) => void, onCancel: () => void }) => {
    const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const addFormAmount = useRef<HTMLInputElement>(null);
    const addFormDate = useRef<HTMLInputElement>(null);
    const addFormMethod = useRef<HTMLInputElement>(null);
    const addFormTaxReturn = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        const fetchTaxReturns = async () => {
            try {
                const response = await axios.get("http://localhost:8080/tax-return");
                setTaxReturns(response.data.map((taxReturn: any) =>
                    new TaxReturn(
                        taxReturn.id,
                        taxReturn.client,
                        taxReturn.cpa,
                        taxReturn.year,
                        taxReturn.status,
                        taxReturn.amountPaid,
                        taxReturn.amountOwed,
                        taxReturn.cost,
                        taxReturn.creationDate,
                        taxReturn.updateDate,
                        taxReturn.employmentSector,
                        taxReturn.totalIncome,
                        taxReturn.adjustments,
                        taxReturn.filingStatus
                    )
                ));
            } catch (error) {
                console.error("Error fetching tax returns:", error);
            }
        };

        fetchTaxReturns();
        console.log("Opened New Payment Form");
    }, []);

    const addPayment = async (event: any): Promise<void> => {
        event.preventDefault();

        try {
            const selectedTaxReturnId = addFormTaxReturn.current?.value
                ? Number(addFormTaxReturn.current.value)
                : null;

            if (!selectedTaxReturnId) {
                setErrorMessage("Please select a tax return.");
                return;
            }

            const newPayment = {
                amount: parseFloat(addFormAmount.current?.value || "0"),
                date: addFormDate.current?.value ? new Date(addFormDate.current.value) : new Date(),
                method: addFormMethod.current?.value || "",
                taxReturn: { id: selectedTaxReturnId }
            };

            const createResponse = await axios.post("http://localhost:8080/payment", newPayment);

            addPaymentToList(createResponse.data);
            onCancel();
        } catch (error) {
            console.error("Error adding payment:", error);
            setErrorMessage("Failed to add payment. Please try again.");
        }
    };

    return (
        <div className="new-client-form">
            <h2>Add Payment</h2>
            <h3>Payment Details</h3>
            <form onSubmit={addPayment}>
                <label>Amount: <input required type="number" step="0.01" ref={addFormAmount} /></label>
                <label>Date: <input required type="date" ref={addFormDate} /></label>
                <label>Method: <input required type="text" ref={addFormMethod} /></label>
                <label>Tax Return: 
                    <select ref={addFormTaxReturn} required>
                        <option value="" disabled>Select Tax Return</option>
                        {taxReturns.map(taxReturn => (
                            <option key={taxReturn.id} value={taxReturn.id}>
                                #{taxReturn.id}: {taxReturn.client.firstName} {taxReturn.client.lastName} - {taxReturn.year}
                            </option>
                        ))}
                    </select>
                </label>
                {errorMessage && <p>{errorMessage}</p>}
                <div className="profile-buttons">
                <button type="submit" className="button-save"><img src="/images/check.png"></img>Submit</button>
                <button type="button" className= "button-cancel" onClick={onCancel}><img src= "/images/no.png"></img>Cancel</button>
                </div>
            </form>
        </div>
    );
};
