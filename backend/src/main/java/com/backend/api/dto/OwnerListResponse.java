package com.backend.api.dto;

import lombok.Data;

@Data
public class OwnerListResponse {
    private String clientGUID;
    private String roleGUID;
    private String roleCode;
    private String ownerName;
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String gender;
    private String tobacco;
    private String countryCode;
    private String stateCode;
    private String ssn;
} 