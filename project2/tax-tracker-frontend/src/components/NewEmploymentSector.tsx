import { useRef, useState } from "react";
import axios from "axios";
import { EmploymentSector } from "../models/EmploymentSector.ts";
import React from "react";
import { Capitalize } from "../Capitalize.ts";

interface NewEmploymentSectorProps {
    onCancel: () => void;
    onSuccess: () => void;
}

export const NewEmploymentSector = ({ onCancel, onSuccess }: NewEmploymentSectorProps) => {
    const addFormEmploymentSectorName = useRef<HTMLInputElement>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const addEmploymentSector = async( event: any): Promise<void> => {
        event.preventDefault();
        setErrorMessage(null);

        if (!addFormEmploymentSectorName.current?.value.trim()) {
            setErrorMessage("Employment sector name cannot be empty.");
            return;
        }

        try {
            await axios.post("http://localhost:8080/employment-sector", {
                employmentSectorName: Capitalize(addFormEmploymentSectorName.current.value)
            });

            addFormEmploymentSectorName.current.value = "";
            await onSuccess(); 
        } catch (error: any) {
            if (error.response && error.response.status === 409) {
                setErrorMessage("This employment sector already exists.");
            } else {
                setErrorMessage("An error occurred while adding the employment sector.");
                console.error("Error adding employment sector:", error);
            }
        }
    };

    return (
        <div className="client-profile">
            <h2>Add Employment Sector</h2>
            <form onSubmit={addEmploymentSector}>
                <label>Employment Sector Name:
                    <input required type="text" ref={addFormEmploymentSectorName} />
                </label>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <div className="profile-buttons">
                    <input type="submit" value="Submit" />
                    <button type="button" className="button-cancel" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};
