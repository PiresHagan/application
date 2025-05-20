package com.backend.api.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OwnerSaveResponse {
    private List<OwnerResponseDTO> owners;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OwnerResponseDTO {
        private String clientGUID;
        private String roleGUID;
        
        // Individual fields
        private String typeCode;
        private String firstName;
        private String lastName;
        private LocalDate dateOfBirth;
        private String gender;
        private String tobacco;
        private String ssn;
        
        // Corporate fields
        private String companyName;
        private String businessRegistrationNumber;
        private String businessType;
        private String relationshipToInsured;
        
        // Address fields
        private String countryCode;
        private String stateCode;
        
        // Professional fields
        private String employer;
        private String occupation;
        private String netWorth;
        private String annualIncome;
        
        // Contact fields
        private String email;
        private String phone;
        
        // Additional metadata
        private String applicationFormGUID;
        private String roleCode;
        private String statusCode;
        
        private List<AddressDTO> addresses;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AddressDTO {
        private String addressGUID;
        private String typeCode;
        private String statusCode;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String stateCode;
        private String countryCode;
        private String zipCode;
    }
} 