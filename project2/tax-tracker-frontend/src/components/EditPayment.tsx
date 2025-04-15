import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Payment } from "../models/Payment";
import { TaxReturn } from "../models/TaxReturn";
import React from 'react';
import '../css/clientprofile.css';

interface EditPaymentProps {
    payment: Payment;
    updatePayment: (payment: Payment) => Promise<void>;
    onCancel: () => void;
}

export const EditPayment = ({ payment, updatePayment, onCancel }: EditPaymentProps) => {

    const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([]);

    const editFormAmount = useRef<HTMLInputElement>(null);
    const editFormDate = useRef<HTMLInputElement>(null);
    const editFormMethod = useRef<HTMLInputElement>(null);
    const editFormTaxReturn = useRef<HTMLSelectElement>(null);

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
        console.log("opened");
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        console.log("updating payment");
        event.preventDefault();

        const date: Date = new Date(Date.parse(editFormDate.current?.value ?? ''));

        const updatedPayment = new Payment(
            payment.id,
            parseFloat(editFormAmount.current?.value || payment.amount.toString()),
            date,
            taxReturns.find(t => t.id.toString() === editFormTaxReturn.current?.value) || payment.taxReturn,
            editFormMethod.current?.value || payment.method
        );

        await updatePayment(updatedPayment);
    };

    return (
        <div className="edit-client-form">
            <h2>Edit Payment</h2>
            <h3>Payment Details</h3>
            <form onSubmit={handleSubmit}>
                <label>Amount: <input type="number" step="0.01" ref={editFormAmount} defaultValue={payment.amount} /></label>
                <label>Date: <input type="date" ref={editFormDate} defaultValue={payment.date.toISOString().split('T')[0]} /></label>
                <label>Method: <input ref={editFormMethod} defaultValue={payment.method} /></label>
                <label>Tax Return:&nbsp;
                    <select ref={editFormTaxReturn} defaultValue={payment.taxReturn?.id || ""}>
                        <option value="" disabled>Select Tax Return</option>
                        {taxReturns.map(taxReturn => (
                            <option key={taxReturn.id} value={taxReturn.id}>
                            #{taxReturn.id}: {taxReturn.client.firstName} {taxReturn.client.lastName} - {taxReturn.year}
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
