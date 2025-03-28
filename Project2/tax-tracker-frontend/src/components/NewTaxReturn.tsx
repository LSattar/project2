import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Client } from "../models/Client.ts";
import { Cpa } from "../models/Cpa.ts";
import { EmploymentSector } from "../models/EmploymentSector.ts";

interface NewTaxReturnProps {
    addTaxReturnToList: (newTaxReturn: any) => void;
    onCancel: () => void;
}

export const NewTaxReturn = ({ addTaxReturnToList, onCancel }: NewTaxReturnProps) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [cpas, setCpas] = useState<Cpa[]>([]);
    const [employmentSectors, setEmploymentSectors] = useState<EmploymentSector[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const selectedClient = useRef<HTMLSelectElement>(null);
    const selectedCpa = useRef<HTMLSelectElement>(null);
    const selectedEmploymentSector = useRef<HTMLSelectElement>(null);

    const inputYear = useRef<HTMLInputElement>(null);
    const inputStatus = useRef<HTMLInputElement>(null);
    const inputAmountPaid = useRef<HTMLInputElement>(null);
    const inputAmountOwed = useRef<HTMLInputElement>(null);
    const inputCost = useRef<HTMLInputElement>(null);
    const inputTotalIncome = useRef<HTMLInputElement>(null);
    const inputAdjustments = useRef<HTMLInputElement>(null);
    const inputFilingStatus = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, cpasRes, employmentSectorsRes] = await Promise.all([
                    axios.get("http://localhost:8080/client"),
                    axios.get("http://localhost:8080/cpa"),
                    axios.get("http://localhost:8080/employment-sector")
                ]);

                setClients(clientsRes.data);
                setCpas(cpasRes.data);
                setEmploymentSectors(employmentSectorsRes.data);
            } catch (error) {
                console.error("Error fetching dropdown data:", error);
            }
        };

        fetchData();
    }, []);

    const addTaxReturn = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);

        try {
            const newTaxReturn = {
                client: { id: Number(selectedClient.current?.value) },
                cpa: selectedCpa.current?.value ? { id: Number(selectedCpa.current?.value) } : null,
                year: inputYear.current?.value ? Number(inputYear.current.value) : null,
                status: inputStatus.current?.value || "",
                amountPaid: inputAmountPaid.current?.value ? parseFloat(inputAmountPaid.current.value) : 0,
                amountOwed: inputAmountOwed.current?.value ? parseFloat(inputAmountOwed.current.value) : 0,
                cost: inputCost.current?.value ? parseFloat(inputCost.current.value) : 0,
                employmentSector: { id: Number(selectedEmploymentSector.current?.value) },
                totalIncome: inputTotalIncome.current?.value ? parseFloat(inputTotalIncome.current.value) : 0,
                adjustments: inputAdjustments.current?.value ? parseFloat(inputAdjustments.current.value) : 0,
                filingStatus: inputFilingStatus.current?.value || "",
            };

            const response = await axios.post("http://localhost:8080/tax-return", newTaxReturn);
            addTaxReturnToList(response.data);
            onCancel();
        } catch (error) {
            if (error.response.status === 409) {
                console.log("409 error")
                setErrorMessage("Client already has a return for this year, please verify entry and try again")
            } else if (error.response.status === 406){
                setErrorMessage("CPA has met their maximum returns for this year, please verify and try again")
            }
            else{
                console.error("Error adding tax return:", error);
                setErrorMessage("Failed to create tax return. Please try again.");
            }
        }
    };

    return (
        <div className="new-tax-return-form">
            <h2>Create New Tax Return</h2>

            {errorMessage && <p className = "error-message">{errorMessage}</p>}

            <form onSubmit={addTaxReturn}>
                <label>Client:
                    <select ref={selectedClient} required>
                        <option value="" disabled>Select Client</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.firstName} {client.lastName}
                            </option>
                        ))}
                    </select>
                </label>
                <label>CPA:
                    <select ref={selectedCpa}>
                        <option value="" disabled>Select CPA (Optional)</option>
                        {cpas.map(cpa => (
                            <option key={cpa.id} value={cpa.id}>
                                {cpa.firstName} {cpa.lastName}
                            </option>
                        ))}
                    </select>
                </label>
                <label>Employment Sector:
                    <select ref={selectedEmploymentSector} required>
                        <option value="" disabled>Select Employment Sector</option>
                        {employmentSectors.map(sector => (
                            <option key={sector.id} value={sector.id}>
                                {sector.employmentSectorName}
                            </option>
                        ))}
                    </select>
                </label>
                <label>Year: <input type="number" ref={inputYear} required min="1900" max="2100" /></label>
                <label>Total Income: <input type="number" ref={inputTotalIncome} step="0.01" /></label>
                <label>Adjustments: <input type="number" ref={inputAdjustments} step="0.01" /></label>
                <label>Filing Status: <input type="text" ref={inputFilingStatus} required /></label>
                <label>Taxes Paid: <input type="number" ref={inputAmountPaid} step="0.01" /></label>
                <label>Taxes Owed: <input type="number" ref={inputAmountOwed} step="0.01" /></label>
                <label>Cost: <input type="number" ref={inputCost} step="0.01" /></label>
                <label>Return Status: <input type="text" ref={inputStatus} required /></label>
                <div className="profile-buttons">
                <button type="submit" className="button-save"><img src="/images/check.png"></img>Submit</button>
                <button type="button" className= "button-cancel" onClick={onCancel}><img src= "/images/no.png"></img>Cancel</button>
                </div>
            </form>
        </div>
    );
};
