package com.backend.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanDto {
    private String planGUID;
    private String planName;
    private String planCode;
} 