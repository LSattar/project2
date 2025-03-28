package com.skillstorm.taxtracker.models;

import jakarta.persistence.*;

@Entity
@Table(name = "employment_sector")
public class EmploymentSector {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private int id;

	@Column(name = "employment_sector_name")
	private String employmentSectorName;

	public EmploymentSector() {
		super();
	}

	public EmploymentSector(int id, String employmentSectorName) {
		super();
		this.id = id;
		this.employmentSectorName = employmentSectorName;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getEmploymentSectorName() {
		return employmentSectorName;
	}

	public void setEmploymentSectorName(String employmentSectorName) {
		this.employmentSectorName = employmentSectorName;
	}

	@Override
	public String toString() {
		return "EmploymentSector [id=" + id + ", employmentSectorName=" + employmentSectorName + "]";
	}

}
