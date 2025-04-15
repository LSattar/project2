import React, { useState, useEffect } from "react";
import axios from "axios";
import { EmploymentSector } from "../models/EmploymentSector";
import '../css/clientprofile.css'

const API_URL = process.env.REACT_APP_URL!;

interface EmploymentSectorProps {
    employmentSectorId: number | null;
    onClose: () => void;
    onSuccess: () => Promise<void>;
}

export const EditEmploymentSector = ({ employmentSectorId, onClose, onSuccess }: EmploymentSectorProps) => {
    const [employmentSector, setEmploymentSector] = useState<EmploymentSector | null>(null);
    const [newName, setNewName] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!employmentSectorId) return;

        const fetchEmploymentSector = async () => {
            try {
                const response = await axios.get(`${API_URL}/employment-sector/${employmentSectorId}`);
                setEmploymentSector(new EmploymentSector(response.data.id, response.data.employmentSectorName));
                setNewName(response.data.employmentSectorName);
            } catch (error) {
                console.error("Error fetching employment sector:", error);
                setErrorMessage("Failed to load employment sector.");
            }
        };

        fetchEmploymentSector();
    }, [employmentSectorId]);

    const handleUpdate = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);

        if (!newName.trim()) {
            setErrorMessage("Employment sector name cannot be empty.");
            return;
        }

        try {
            await axios.put(`${API_URL}/employment-sector/${employmentSectorId}`, {
                employmentSectorName: newName.trim()
            });

            await onSuccess(); 
            onClose();        
        } catch (error: any) {
            if (error.response?.status === 409) {
                setErrorMessage("This employment sector already exists."); 
            } else {
                setErrorMessage("An error occurred while updating the employment sector.");
                console.error("Error updating employment sector:", error);
            }
        }
    };

    if (!employmentSector) return null;

    return (
        <div className="client-profile">
            <h2>Edit Employment Sector</h2>

            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

            <form onSubmit={handleUpdate}>
                <label>
                    Employment Sector Name:
                    <input 
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new sector name"
                    />
                </label>
                
                <div className="profile-buttons">
                    <button type="submit" className="button-save"><img src="/images/check.png"></img>Submit</button>
                    <button type="button" className= "button-cancel" onClick={onClose}><img src= "/images/x.png"></img>Cancel</button>
                </div>
            </form>
        </div>
    );
};