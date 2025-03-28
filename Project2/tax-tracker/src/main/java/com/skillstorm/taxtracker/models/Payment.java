package com.skillstorm.taxtracker.models;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.*;


@Entity
@Table(name = "payment")
public class Payment {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private int id;
	
	@Column(name = "amount")
	private BigDecimal amount;
	
	@Column(name = "date")
	private LocalDate date;
	
	@ManyToOne
	@JoinColumn(name = "return_id")
	private TaxReturn taxReturn;
	
	@Column(name = "method")
	private String method;

	public Payment() {
		super();
	}

	public Payment(int id, BigDecimal amount, LocalDate date, TaxReturn taxReturn, String method) {
		super();
		this.id = id;
		this.amount = amount;
		this.date = date;
		this.taxReturn = taxReturn;
		this.method = method;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public BigDecimal getAmount() {
		return amount;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}

	public LocalDate getDate() {
		return date;
	}

	public void setDate(LocalDate date) {
		this.date = date;
	}

	public TaxReturn getTaxReturn() {
		return taxReturn;
	}

	public void setTaxReturn(TaxReturn taxReturn) {
		this.taxReturn = taxReturn;
	}

	public String getMethod() {
		return method;
	}

	public void setMethod(String method) {
		this.method = method;
	}

}
