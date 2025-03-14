package com.backend.api.entity;

import lombok.Data;
import jakarta.persistence.*;

@Data
@Entity
@Table(name = "frcompany")
public class FrCompany {
    @Id
    @Column(name = "CompanyGUID")
    private String companyGUID;

    @Column(name = "CompanyName")
    private String companyName;

    @Column(name = "CompanyCode")
    private String companyCode;
} 