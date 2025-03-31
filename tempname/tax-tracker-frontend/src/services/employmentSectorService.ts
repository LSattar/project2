import axios from "axios";
import { EmploymentSector } from "../models/EmploymentSector.ts";

export const getAllEmploymentSectors = async (): Promise<EmploymentSector[]> => {
    try {
        const response = await axios.get("http://localhost:8080/employment-sector");
        return response.data.map((sector: any) => 
            new EmploymentSector(sector.id, sector.employmentSectorName)
        );
    } catch (error) {
        console.error("Error fetching employment sectors:", error);
        throw new Error("Failed to fetch employment sectors.");
    }
};