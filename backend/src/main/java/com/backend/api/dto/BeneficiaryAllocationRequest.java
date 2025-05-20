package com.backend.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class BeneficiaryAllocationRequest {
    private String applicationFormNumber;
    private List<BeneficiaryAllocationDTO> beneficiaryAllocations;
    
    @Data
    @NoArgsConstructor
    public static class BeneficiaryAllocationDTO {
        private String roleGUID;
        private String coverageId;
        private String type; // primary or contingent
        private String relationshipToInsured;
        private String relatedInsured;
        private String allocation;
    }
} 