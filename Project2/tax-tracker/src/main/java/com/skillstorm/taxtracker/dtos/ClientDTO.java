package com.skillstorm.taxtracker.dtos;

import java.time.LocalDate;

import com.skillstorm.taxtracker.models.EmploymentSector;

public record ClientDTO (String firstName, String lastName, String ssn, LocalDate dob, String phone, String email, String address1,
			String address2, String city, String state, String zip, EmploymentSector employmentSector){

}
