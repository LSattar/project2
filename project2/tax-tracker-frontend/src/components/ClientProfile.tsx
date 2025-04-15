import { useState, useEffect } from "react";
import axios from "axios";
import { Client } from "../models/Client";
import React from 'react';
import '../css/clientprofile.css';
import { EditClient } from "./EditClient";

const API_URL = process.env.REACT_APP_URL!;

interface ClientProfileProps {
    clientId: number;
    onClose: () => void;
    getAllClients: () => Promise<void>;
}

export const ClientProfile = ({ clientId, onClose, getAllClients }: ClientProfileProps) => {
    const [client, setClient] = useState<Client | null>(null);
    const [isEditing, setIsEditing] = useState(false);
            const [balance, setBalance] = useState<number | null>(null);

    console.log("Profile opened");

    useEffect(() => {
        if (!clientId) return;

        const fetchClient = async () => {
            try {
                const response = await axios.get(`${API_URL}/client/${clientId}`);
                const clientData = response.data;
                setClient(new Client(
                    clientData.id, clientData.firstName, clientData.lastName,
                    clientData.ssn, clientData.hashed_ssn, clientData.dob,
                    clientData.phone, clientData.email, clientData.address1,
                    clientData.address2, clientData.city, clientData.state, clientData.zip, clientData.employmentSector
                ));
            } catch (error) {
                console.error("Error fetching client details:", error);
            }
        };

        fetchClient();
    }, [clientId]);

    const updateClient = async (updatedClient: Client) => {
        try {
            await axios.put(`${API_URL}/client/${updatedClient.id}`, updatedClient);
            setClient(updatedClient);
            setIsEditing(false); 
        } catch (error) {
            console.error("Error updating client:", error);
        }
    };

    useEffect(() => {
        const getClientBalance = async () => {
            try {
                const response = await axios.get(`${API_URL}/payment/client/${clientId}/balance`);
                setBalance(response.data); 
            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        };

        if (client?.id) {
            getClientBalance();
        }
    }, [client]);

    const deactivateClient = async (deactivatedClient: Client) => {
        if (!window.confirm("Are you sure you want to make this client inactive? This record can only be re-activated using this client's social security number.")) return;
    
        try {
            await axios.put(`${API_URL}/client/${deactivatedClient.id}/deactivate`);
            
            setIsEditing(false); 
            onClose();
            getAllClients();
        } catch (error) {
            console.error("Error deactivating client:", error);
        }
    };

    if (!client) return null;

    return (
            <div className="client-profile">
            {isEditing ? (
                <EditClient client={client} updateClient={updateClient} onCancel={() => setIsEditing(false)} />
            ) : (
                <>
                <h2>Client Profile</h2>
                <div className="container">
                    
                    <div className = "column">
                    <h3>Basic Info</h3>
                    <p><strong>ID: </strong> {client.id}</p>
                    <p><strong>Name: </strong> {client.firstName} {client.lastName}</p>
                    <p><strong>DOB: </strong> {(!client.dob) ? null : client.dob.toLocaleString("en-US")}</p>
                    <p><strong>SSN: </strong> 
                        <span className="ssn-container">
                            <span className="hidden">{client.ssn}</span>
                            <span className="hover"> <img src= "/images/view.png"></img></span>
                        </span>
                    </p>
                    <p><strong>Employment Sector: </strong> {client.employmentSector ? client.employmentSector.employmentSectorName : "Not Available"}</p>
<p><strong>Account Balance: </strong> ${balance}</p>
</div>
                    <div className = "column">                    <h3>Contact Info</h3>
                    <p><strong>Phone: </strong> {client.phone}</p>
                    <p><strong>Email: </strong> {client.email}</p>
                    <p><strong>Address 1: </strong> {client.address1}</p>
                    <p><strong>Address 2: </strong> {client.address2}</p>
                    <p><strong>City: </strong> {client.city}</p>
                    <p><strong>State: </strong> {client.state}</p>
                    <p><strong>Zip: </strong> {client.zip}</p></div>
                </div>



                    <div className="profile-buttons">
                        <button className="button-update" onClick={() => setIsEditing(true)}><img className = "button-image" src = "/images/pencil-white.png"></img> Edit </button>
                        <button className="button-cancel" onClick={onClose}><img className = "button-image" src= "/images/x.png"></img>Close </button>
                        <button className="button-warning" onClick={() => deactivateClient(client)}><img className = "button-image" src= "/images/no.png"></img>Deactivate</button>
                    </div>
                </>
            )}
        </div>
    );
};