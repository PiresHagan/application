package com.backend.api.dto;

import lombok.Data;

@Data
public class InsuredSaveRequest {
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String gender;
    private String tobacco;
    private String countryCode;
    private String stateCode;
    private String ssn;
    private String applicationFormNumber;
} 