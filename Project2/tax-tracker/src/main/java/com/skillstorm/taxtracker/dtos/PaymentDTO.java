package com.skillstorm.taxtracker.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.skillstorm.taxtracker.models.TaxReturn;

public record PaymentDTO(BigDecimal amount, LocalDate date, TaxReturn taxReturn, String method) {

}
