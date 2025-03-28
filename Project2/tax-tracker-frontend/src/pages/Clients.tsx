import axios, { AxiosHeaders } from 'axios';
import { useState, useEffect, useRef } from 'react';
import { Client } from '../models/Client.ts';
import React from 'react';
import { ClientProfile } from '../components/ClientProfile.tsx';
import { EditClient } from '../components/EditClient.tsx';
import { NewClient } from '../components/NewClient.tsx';

export const Clients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [editingClientId, setEditingClientId] = useState<number | null>(null);
    const [isAddingClient, setIsAddingClient] = useState<boolean>(false);

    let myHeaders: AxiosHeaders = new AxiosHeaders();
    myHeaders.set('Content-Type', 'application/json');

    useEffect(() => {
        getAllClients();
    }, []);

    const getAllClients = async (event?: React.FormEvent) => {
        if (event) event.preventDefault();

        try {
            const startsWithValue = startsWith.current.value.trim();
            const response = await axios.get("http://localhost:8080/client", {
                headers: myHeaders,
                params: startsWithValue ? { startsWith: startsWithValue } : {}
            });

            setClients(response.data.map((client: any) =>
                new Client(
                    client.id, client.firstName, client.lastName,
                    client.ssn, client.hashed_ssn, client.dob,
                    client.phone, client.email, client.address1,
                    client.address2, client.city, client.state, client.zip, client.employmentSector
                )
            ));
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const startsWith: any = useRef('');

    const addClientToList = (newClient: Client) => {
        setClients(prevClients => [...prevClients, newClient]);
        setIsAddingClient(false);
    };

    const updateClient = async (client: Client): Promise<void> => {
        try {
            await axios.put(`http://localhost:8080/client/${client.id}`, {
                firstName: client.firstName,
                lastName: client.lastName,
                ssn: client.ssn,
                hashed_ssn: client.hashed_ssn,
                dob: client.dob,
                phone: client.phone,
                email: client.email,
                address1: client.address1,
                address2: client.address2,
                city: client.city,
                state: client.state,
                zip: client.zip,
                employmentSector: client.employmentSector
            });
            await getAllClients();
            setEditingClientId(null);
        } catch (error) {
            console.error("Error updating client:", error);
        }
    };

    return (
        <main>
            <h1>Clients</h1>

            <div className='top-menu'>
                <form onSubmit={getAllClients}>
                    <div className='search'>
                        <label htmlFor="startsWith">Search by Last Name: </label>
                        <input
                            type="text"
                            id="startsWith"
                            name="startsWith"
                            ref={startsWith}
                            onChange={getAllClients}
                        />

                    </div>
                </form>

                <button onClick={() => setIsAddingClient(true)}>Add New Client</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>City</th>
                        <th>State</th>
                        <th>Edit</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map(client => (
                        <tr key={client.id}>
                            <td>{client.id}</td>
                            <td>
                                <div className='button-container'>                                <button className="name-link"
                                    onClick={() => setSelectedClientId(client.id)}
                                >
                                    {client.firstName} {client.lastName}
                                </button></div>

                            </td>
                            <td>{client.email}</td>
                            <td>{client.phone}</td>
                            <td>{client.city}</td>
                            <td>{client.state}</td>
                            <td> <div className='button-container'>                                <button
                                className='icon'
                                onClick={() => { console.log("set editing id: " + client.id); setEditingClientId(client.id) }}
                            >
                                <img src="/images/pencil.png" alt="Edit" />
                            </button></div>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedClientId && !editingClientId && (
                <div className="main-content">
                    <div className="client-profile-overlay">
                        <ClientProfile
                            clientId={selectedClientId}
                            onClose={() => setSelectedClientId(null)}
                            getAllClients={getAllClients}
                        />
                    </div>
                </div>
            )}

            {editingClientId && (
                <div className="main-content">
                    <div className="client-profile-overlay">
                        <div className="client-profile">
                            <EditClient
                                client={clients.find(client => client.id === editingClientId)!}
                                updateClient={updateClient}
                                onCancel={() => setEditingClientId(null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {isAddingClient && (
                <div className="main-content">
                    <div className="client-profile-overlay">
                        <div className="client-profile">
                            <NewClient
                                addClientToList={addClientToList}
                                onCancel={() => setIsAddingClient(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
