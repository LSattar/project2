import axios from 'axios';
import React from 'react';
import { EmploymentSector } from '../models/EmploymentSector.ts';
import { useState, useEffect, useRef } from 'react';
import { Capitalize } from '../Capitalize.ts';
import { NewEmploymentSector } from '../components/NewEmploymentSector.tsx';
import { EditEmploymentSector } from '../components/EditEmploymentSector.tsx';

export const EmploymentSectors = () => {
    const [employmentSectors, setEmploymentSectors] = useState<EmploymentSector[]>([]);
    const [selectedEmploymentSectorId, setSelectedEmploymentSectorId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const startsWith: any = useRef('');

    const getAllEmploymentSectors = async (event?: React.FormEvent) => {
        if (event) event.preventDefault();

        try {
            const startsWithValue = startsWith.current?.value?.trim() || "";
            const response = await axios.get("http://localhost:8080/employment-sector", {
                params: startsWithValue ? { startsWith: startsWithValue } : {}
            });

            setEmploymentSectors(response.data.map((sector: any) =>
                new EmploymentSector(sector.id, sector.employmentSectorName)
            ));
        } catch (error) {
            console.error("Error fetching employment sectors:", error);
        }
    };

    useEffect(() => {
        getAllEmploymentSectors();
    }, []);

    const addFormName = useRef<HTMLInputElement>(null);

    const addEmploymentSector = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);

        if (!addFormName.current?.value.trim()) {
            setErrorMessage("Employment sector name cannot be empty.");
            return;
        }

        try {
            await axios.post("http://localhost:8080/employment-sector", {
                employmentSectorName: Capitalize(addFormName.current.value)
            });

            addFormName.current.value = "";
            await getAllEmploymentSectors();
        } catch (error: any) {
            if (error.response?.status === 409) {
                setErrorMessage("This employment sector already exists.");
            } else {
                setErrorMessage("An error occurred while adding the employment sector.");
                console.error("Error adding employment sector:", error);
            }
        }
    };

    const deleteEmploymentSector = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this employment sector?")) return;

        try {
            await axios.delete(`http://localhost:8080/employment-sector/${id}`);
            setEmploymentSectors((prevSectors) => prevSectors.filter(sector => sector.id !== id));
        } catch (error) {
            console.error("Error deleting employment sector:", error);
            setErrorMessage("Failed to delete employment sector. This category is already in use");
        }
    };

    return (
        <main>
            <h1>Employment Sectors</h1>

            <div className='top-menu'>
                <form onSubmit={getAllEmploymentSectors}>
                    <div className='search'>
                        <label htmlFor="startsWith">Search By Employment Sector: </label>
                        <input
                            type="text"
                            id="startsWith"
                            name="startsWith"
                            ref={startsWith}
                            onChange={getAllEmploymentSectors}
                        />

                    </div>
                </form>
                <button onClick={() => setIsAdding(true)}>Add Employment Sector</button>
            </div>

            {errorMessage && <p className='error-message'>{errorMessage}</p>}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Sector Name</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {employmentSectors.map(sector => (
                        <tr key={sector.id}>
                            <td>{sector.id}</td>
                            <td>{sector.employmentSectorName}</td>
                            <td>
                                <div className='button-container'>                                <button
                                    className='icon'
                                    onClick={() => setSelectedEmploymentSectorId(sector.id)}
                                >
                                    <img src="/images/pencil.png" alt="Edit" />
                                </button></div>

                            </td>
                            <td>
                                <div className='button-container'>                                <button
                                    className='icon'
                                    onClick={() => deleteEmploymentSector(sector.id)}
                                >
                                    <img src="/images/trash-can.png" alt="Delete" width="20" height="20" />
                                </button></div>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedEmploymentSectorId && (
                <div className="main-content">
                    <div className="client-profile-overlay">
                        <EditEmploymentSector
                            employmentSectorId={selectedEmploymentSectorId}
                            onClose={() => setSelectedEmploymentSectorId(null)}
                            onSuccess={async () => {
                                setSelectedEmploymentSectorId(null);
                                await getAllEmploymentSectors();
                            }}
                        />
                    </div>
                </div>
            )}

            {isAdding && (
                <div className="main-content">
                    <div className="client-profile-overlay">
                        <NewEmploymentSector
                            onCancel={() => setIsAdding(false)}
                            onSuccess={async () => {
                                setIsAdding(false);
                                await getAllEmploymentSectors(); // Refresh list after adding
                            }}
                        />
                    </div>
                </div>
            )}
        </main>
    );
};