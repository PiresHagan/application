package com.backend.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BaseCoverageSaveRequest {
    private String coverageType;
    private String insured1;
    private String insured2;
    private String faceAmount;
    private String tableRating;
    private boolean permanentFlatExtra;
    private String permanentFlatExtraAmount;
    private boolean temporaryFlatExtra;
    private String temporaryFlatExtraAmount;
    private String temporaryFlatExtraDuration;
    private String underwritingClass;
    private String planGUID;
} 