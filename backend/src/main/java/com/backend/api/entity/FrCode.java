package com.backend.api.entity;

import lombok.Data;
import jakarta.persistence.*;

@Data
@Entity
@Table(name = "frcode")
@IdClass(FrCodeId.class)  // Add composite key class
public class FrCode {
    @Id
    @Column(name = "CodeName")
    private String codeName;

    @Id
    @Column(name = "CodeValue")
    private String codeValue;

    @Column(name = "DescriptionShort")
    private String descriptionShort;

    @Column(name = "DescriptionLong")
    private String descriptionLong;
} 