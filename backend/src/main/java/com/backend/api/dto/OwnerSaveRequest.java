package com.backend.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
public class OwnerSaveRequest {
    private String applicationFormNumber;
    private List<OwnerDTO> owners;

    @Data
    @NoArgsConstructor
    public static class OwnerDTO {
       // frapplicationform fields
       private LocalDate lastModifiedDate;
       private String planGUID;

      
        // frclient fields
        private String clientGUID;
        private String typeCode;  
        private String firstName;
        private String lastName;
        private String companyName;
        private LocalDate dateOfBirth;
        private String gender;
        private String tobacco;
        private String countryCode;
        private String stateCode;
        private String ssn;
        private String businessRegistrationNumber;

        // frrole fields
        private String roleGUID;
        private String roleCode;
        private String statusCode;

        // fraddress fields
        private List<AddressDTO> addresses;
    }

    @Data
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