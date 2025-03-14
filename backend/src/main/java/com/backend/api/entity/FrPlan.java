package com.backend.api.entity;

import lombok.Data;
import jakarta.persistence.*;

@Data
@Entity
@Table(name = "frplan")
public class FrPlan {
    @Id
    @Column(name = "PlanGUID")
    private String planGUID;

    @Column(name = "PlanName")
    private String planName;

    @Column(name = "PlanCode")
    private String planCode;

    @Column(name = "ProductGUID")
    private String productGUID;

    @Column(name = "EffectiveDate")
    private java.time.LocalDate effectiveDate;
} 