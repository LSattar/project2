package com.skillstorm.taxtracker.models;

import jakarta.persistence.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.skillstorm.taxtracker.models.*;
import com.skillstorm.taxtracker.utils.HashUtil;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.*;

@Entity
@Table(name = "client")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "ssn", unique = true, nullable = true) // Allow null if deactivated
    private String ssn;

    @Column(name = "hashed_ssn", unique = true, nullable = false)
    @JsonIgnore
    private String hashedSsn;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "address1")
    private String address1;

    @Column(name = "address2")
    private String address2;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "zip")
    private String zip;

    @ManyToOne
    @JoinColumn(name = "employment_sector_id")
    private EmploymentSector employmentSector;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

	public Client() {
	}

	public Client(int id, String firstName, String lastName, String ssn, LocalDate dob, String phone, String email,
			String address1, String address2, String city, String state, String zip,
			EmploymentSector employmentSector) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.ssn = ssn; // Store plain SSN initially
		this.hashedSsn = HashUtil.hashSSN(ssn); // Hash SSN for reactivation + security purposes
		this.dob = dob;
		this.phone = phone;
		this.email = email;
		this.address1 = address1;
		this.address2 = address2;
		this.city = city;
		this.state = state;
		this.zip = zip;
		this.employmentSector = employmentSector;
		this.isActive = true;
	}

	public Client(int id, String firstName, String lastName, String ssn, String hashedSsn, LocalDate dob, String phone,
			String email, String address1, String address2, String city, String state, String zip,
			EmploymentSector employmentSector, boolean isActive) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.ssn = ssn;
		this.hashedSsn = hashedSsn;
		this.dob = dob;
		this.phone = phone;
		this.email = email;
		this.address1 = address1;
		this.address2 = address2;
		this.city = city;
		this.state = state;
		this.zip = zip;
		this.employmentSector = employmentSector;
		this.isActive = isActive;
	}

	public void deactivateClient() {
	    this.isActive = false;	    
	    this.firstName = null;
	    this.lastName = null;
	    this.ssn = null; 
	    this.dob = null;
	    this.phone = null;
	    this.email = null;
	    this.address1 = null;
	    this.address2 = null;
	    this.city = null;
	    this.state = null;
	    this.zip = null;
	}

	public void reactivateClient(String firstName, String lastName, String ssn, LocalDate dob, String phone,
			String email, String address1, String address2, String city, String state, String zip) {
		this.isActive = true;
		this.firstName = firstName;
		this.lastName = lastName;
		this.ssn = ssn; 
		this.dob = dob;
		this.phone = phone;
		this.email = email;
		this.address1 = address1;
		this.address2 = address2;
		this.city = city;
		this.state = state;
		this.zip = zip;
	}

	public String getHashedSsn() {
		return hashedSsn;
	}

	public boolean isActive() {
		return isActive;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getFirstName() {
		return firstName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getSsn() {
		return ssn;
	}

	public void setSsn(String ssn) {
		this.ssn = ssn;
	}

	public LocalDate getDob() {
		return dob;
	}

	public void setDob(LocalDate dob) {
		this.dob = dob;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getAddress1() {
		return address1;
	}

	public void setAddress1(String address1) {
		this.address1 = address1;
	}

	public String getAddress2() {
		return address2;
	}

	public void setAddress2(String address2) {
		this.address2 = address2;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}
	
	public String getZip() {
		return zip;
	}

	public void setZip(String zip) {
		this.zip = zip;
	}

	public void setActive(boolean isActive) {
		this.isActive = isActive;
	}

	public EmploymentSector getEmploymentSector() {
		return employmentSector;
	}

	public void setEmploymentSector(EmploymentSector employmentSector) {
		this.employmentSector = employmentSector;
	}

}
