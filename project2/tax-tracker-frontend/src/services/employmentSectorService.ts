import axios from "axios";
import { EmploymentSector } from "../models/EmploymentSector";

const API_URL = process.env.REACT_APP_URL!;


export const getAllEmploymentSectors = async (): Promise<EmploymentSector[]> => {
    try {
        const response = await axios.get(`${API_URL}/employment-sector`);
        return response.data.map((sector: any) => 
            new EmploymentSector(sector.id, sector.employmentSectorName)
        );
    } catch (error) {
        console.error("Error fetching employment sectors:", error);
        throw new Error("Failed to fetch employment sectors.");
    }
};