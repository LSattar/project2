import { Cpa } from "./Cpa.ts";
import { Client } from "./Client.ts";
import { EmploymentSector } from "./EmploymentSector.ts";

export class TaxReturn {
    id: number;
    client: Client;
    cpa: Cpa;
    year: number;
    status: string;
    amountPaid: number;
    amountOwed: number;
    cost: number;
    creationDate: Date;
    updateDate: Date;
    employmentSector: EmploymentSector;
    totalIncome: number;
    adjustments: number;
    filingStatus: string;
  
    constructor(
      id: number,
      client: Client,
      cpa: Cpa,
      year: number,
      status: string,
      amountPaid: number,
      amountOwed: number,
      cost: number,
      creationDate: Date,
      updateDate: Date,
      employmentSector: EmploymentSector,
      totalIncome: number,
      adjustments: number,
      filingStatus: string
    ) {
      this.id = id;
      this.client = client;
      this.cpa = cpa;
      this.year = year;
      this.status = status;
      this.amountPaid = amountPaid;
      this.amountOwed = amountOwed;
      this.cost = cost;
      this.creationDate = creationDate;
      this.updateDate = updateDate;
      this.employmentSector = employmentSector;
      this.totalIncome = totalIncome;
      this.adjustments = adjustments;
      this.filingStatus = filingStatus;
    }
  }