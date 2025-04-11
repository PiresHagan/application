package com.backend.api.entity;

import lombok.Data;
import java.io.Serializable;

@Data
public class FrCodeId implements Serializable {
    private String codeName;
    private String codeValue;
} 