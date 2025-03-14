package com.backend.api.entity;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "frproduct")
public class FrProduct {
    @Id
    @Column(name = "ProductGUID")
    private String productGUID;

    @Column(name = "ProductName")
    private String productName;

    @Column(name = "ProductCode")
    private String productCode;

    @Column(name = "EffectiveDate")
    private LocalDate effectiveDate;

    @Column(name = "CompanyGUID")
    private String companyGUID;
} 