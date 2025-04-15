import { useEffect, useState, useRef } from "react";
import React from 'react';
import { Payment } from "../models/Payment";
import axios from "axios";
import { NewPayment } from "../components/NewPayment";
import { EditPayment } from "../components/EditPayment";

export const Payments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
    const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
    const [isAddingPayment, setIsAddingPayment] = useState<boolean>(false);

    useEffect(() => {
        getAllPayments();
    }, []);

    const getAllPayments = async () => {
        try {
            const response = await axios.get("http://localhost:8080/payment", {
            });

            setPayments(response.data.map((payment: any) =>
                new Payment(
                    payment.id,
                    payment.amount,
                    new Date(payment.date),
                    payment.taxReturn,
                    payment.method
                )
            ));
        } catch (error) {
            console.error("Error fetching payments:", error);
        }
    };

    const addPaymentToList = (newPayment: Payment) => {
        setPayments(prevPayments => [...prevPayments, newPayment]);
        setIsAddingPayment(false);
    };

    const deletePayment = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this payment?")) return;

        try {
            await axios.delete(`http://localhost:8080/payment/${id}`);
            setPayments((prevPayments) => prevPayments.filter(payment => payment.id !== id));
        } catch (error) {
            console.error("Error deleting payment:", error);
        }
    };

    const updatePayment = async (payment: Payment): Promise<void> => {
        try {
            await axios.put(`http://localhost:8080/payment/${payment.id}`, {
                amount: payment.amount,
                date: payment.date,
                taxReturn: payment.taxReturn,
                method: payment.method
            });
            await getAllPayments();
            setEditingPaymentId(null);
        } catch (error) {
            console.error("Error updating payment:", error);
        }
    };

    return (
        <main>
            <h1>Payments</h1>

            <div className='top-menu'>
                <button onClick={() => setIsAddingPayment(true)}>Add New Payment</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Tax Return ID</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(payment => (
                        <tr key={payment.id}>
                            <td>{payment.id}</td>
                            <td>${payment.amount.toFixed(2)}</td>
                            <td>{new Date(payment.date).toLocaleDateString("en-US")}</td>
                            <td>{payment.method}</td>
                            <td>{payment.taxReturn.id}</td>
                            <td>
                                <div className = "button-container">                                <button
                                    className='icon'
                                    onClick={() => { console.log("set editing id: " + payment.id); setEditingPaymentId(payment.id) }}
                                >
                                    <img src="/images/pencil.png" alt="Edit" />
                                </button></div>


                            </td>
                            <div className = "button-container">                                <button 
                                    className='icon' 
                                    onClick={() => deletePayment(payment.id)}
                                >
                                    <img src="/images/trash-can.png" alt="Delete" width="20" height="20" />
                                </button></div>
                            <td>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedPaymentId && !editingPaymentId && (
                <div className="main-content">
                    <div className="client-profile-overlay">
                        <div className="client-profile">
                            <EditPayment
                                payment={payments.find(payment => payment.id === selectedPaymentId)!}
                                updatePayment={updatePayment}
                                onCancel={() => setSelectedPaymentId(null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {editingPaymentId && (
                <div className="main-content">
                    <div className="client-profile-overlay">
                        <div className="client-profile">
                            <EditPayment
                                payment={payments.find(payment => payment.id === editingPaymentId)!}
                                updatePayment={updatePayment}
                                onCancel={() => setEditingPaymentId(null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {isAddingPayment && (
                <div className="main-content">
                    <div className="client-profile-overlay">
                        <div className="client-profile">
                            <NewPayment
                                addPaymentToList={addPaymentToList}
                                onCancel={() => setIsAddingPayment(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};
