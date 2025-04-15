import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { Client } from '../models/Client';
import React from 'react';
import { ClientProfile } from '../components/ClientProfile';
import { TaxReturn } from '../models/TaxReturn';
import { Cpa } from '../models/Cpa';
import { TaxReturnProfile } from '../components/TaxReturnProfile';
import { EditTaxReturn } from '../components/EditTaxReturn';
import { NewTaxReturn } from '../components/NewTaxReturn';
import { EmploymentSector } from '../models/EmploymentSector';
import { getAllEmploymentSectors } from '../services/employmentSectorService';

const API_URL = process.env.REACT_APP_URL!;

export const TaxReturns = () => {
    const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([]);
    const [selectedTaxReturnId, setSelectedTaxReturnId] = useState<number | null>(null);
    const [editingTaxReturnId, setEditingTaxReturnId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [addingTaxReturn, setAddingTaxReturn] = useState<boolean>(false);
    const [employmentSectors, setEmploymentSectors] = useState<EmploymentSector[]>([]);
    const [selectedSector, setSelectedSector] = useState<string>("");
    const startsWith: any = useRef('');

    useEffect(() => {
        const fetchEmploymentSectors = async () => {
            try {
                const sectors = await getAllEmploymentSectors();
                setEmploymentSectors(sectors);
            } catch (error) {
                console.error("Failed to fetch employment sectors:", error);
            }
        };

        fetchEmploymentSectors();
        getAllTaxReturns();
    }, []);

    const getAllTaxReturns = async () => {
        try {
            let url = `${API_URL}/tax-return`;

            if (selectedSector) {
                url += `/employment-sector/${selectedSector}`;
            }

            const response = await axios.get(url);
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
            console.error("Error retrieving tax returns:", error);
            setErrorMessage("Failed to retrieve tax returns.");
        }
    };

    useEffect(() => {
        getAllTaxReturns();
    }, [selectedSector]);

    const deleteTaxReturn = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this tax return?")) return;

        try {
            await axios.delete(`${API_URL}/tax-return/${id}`);
            setTaxReturns((prevTaxReturns) => prevTaxReturns.filter(taxReturn => taxReturn.id !== id));
        } catch (error) {
            console.error("Error deleting tax return:", error);
            setErrorMessage("Failed to delete tax return");
        }
    };

    const updateTaxReturn = async (taxReturn: TaxReturn): Promise<void> => {
        try {
            const taxReturnPayload = {
                client: taxReturn.client,
                cpa: taxReturn.cpa,
                year: taxReturn.year,
                status: taxReturn.status,
                amountPaid: taxReturn.amountPaid,
                amountOwed: taxReturn.amountOwed,
                cost: taxReturn.cost,
                creationDate: taxReturn.creationDate,
                updateDate: new Date().toISOString(),
                employmentSector: taxReturn.employmentSector,
                totalIncome: taxReturn.totalIncome,
                adjustments: taxReturn.adjustments,
                filingStatus: taxReturn.filingStatus
            };

            const apiUrl = `${API_URL}/tax-return/${taxReturn.id}`;
            await axios.put(apiUrl, taxReturnPayload);

            // Retrieve latest data after update
            const updatedTaxReturns = await axios.get(`${API_URL}/tax-return`);
            setTaxReturns(updatedTaxReturns.data.map((taxReturn: any) =>
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

            setEditingTaxReturnId(null);
        } catch (error) {
            console.error("Error updating tax return:", error);
        }
    };

    useEffect(() => {
        getAllTaxReturns();
    }, []);

    return (
        <main>
            <h1>Tax Returns</h1>
            <div className='top-menu'>
                <div className='search'>
                    <label htmlFor="employmentSector">Filter by Employment Sector: </label>
                    <select
                        id="employmentSector"
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                    >
                        <option value="">All Sectors</option>
                        {employmentSectors.map(sector => (
                            <option key={sector.id} value={sector.id}>
                                {sector.employmentSectorName}
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={() => setAddingTaxReturn(true)}>Create New Tax Return</button>            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name - Year</th>
                        <th>Amount Owed</th>
                        <th>Amount Paid</th>
                        <th>Employment Sector</th>
                        <th>Assigned To</th>
                        <th>Status</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {taxReturns.map(taxReturn => (
                        <tr key={taxReturn.id}>
                            <td>{taxReturn.id}</td>
                            <td>
                                <div className='button-container'>                                
                                    <button className='name-link'
                                    onClick={() => setSelectedTaxReturnId(taxReturn.id)}
                                >
                                    {taxReturn.client.firstName == null
                                        ? "[INACTIVE]"
                                        : `${taxReturn.client.firstName} ${taxReturn.client.lastName}`} - {taxReturn.year}
                                </button></div>

                            </td>
                            <td>${taxReturn.amountOwed.toFixed(2)}</td>
                            <td>${taxReturn.amountPaid.toFixed(2)}</td>
                            <td>{taxReturn.employmentSector.employmentSectorName}</td>
                            <td>{taxReturn.cpa.firstName} {taxReturn.cpa.lastName}</td>
                            <td>{taxReturn.status}</td>
                            <td>
                                <div className='button-container'>                                <button
                                    className='icon'
                                    onClick={() => setEditingTaxReturnId(taxReturn.id)}
                                >
                                    <img src="/images/pencil.png" alt="Edit" />
                                </button></div>

                            </td>
                            <td>
                                <div className='button-container'>                                <button
                                    className='icon'
                                    onClick={() => deleteTaxReturn(taxReturn.id)}
                                >
                                    <img src="/images/trash-can.png" alt="Delete" width="20" height="20" />
                                </button></div>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedTaxReturnId && !editingTaxReturnId && !addingTaxReturn && (
                <div className="main-content">
                    <div className="client-profile-overlay">
                        <div className="client-profile">
                            <TaxReturnProfile
                                taxReturnId={selectedTaxReturnId}
                                onClose={() => setSelectedTaxReturnId(null)}
                                setEditingTaxReturnId={setEditingTaxReturnId}
                            />
                        </div>
                    </div>
                </div>
            )}

            {editingTaxReturnId && !addingTaxReturn && (
                <div className="main-content">
                    <div className="client-profile-overlay">
                        <div className="client-profile">
                            <EditTaxReturn
                                taxReturn={taxReturns.find(t => t.id === editingTaxReturnId)!}
                                updateTaxReturn={updateTaxReturn}
                                onCancel={() => setEditingTaxReturnId(null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {addingTaxReturn && (
                <div className="main-content">
                    <div className="client-profile-overlay">
                        <div className="client-profile">
                            <NewTaxReturn
                                addTaxReturnToList={getAllTaxReturns}
                                onCancel={() => setAddingTaxReturn(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};