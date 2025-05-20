package com.backend.api.service;

import com.backend.api.dto.BeneficiaryAllocationRequest;
import com.backend.api.dto.BeneficiaryAllocationRequest.BeneficiaryAllocationDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.UUID;

@Service
@Transactional
@Slf4j
public class BeneficiaryService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public void saveBeneficiaryAllocations(BeneficiaryAllocationRequest request) {
        String applicationFormNumber = request.getApplicationFormNumber();
        
        log.info("Saving beneficiary allocations for application: {}", applicationFormNumber);
        
        for (BeneficiaryAllocationDTO allocation : request.getBeneficiaryAllocations()) {
            String roleGUID = allocation.getRoleGUID();
            String coverageId = allocation.getCoverageId();
            String type = allocation.getType();
            String relationshipToInsured = allocation.getRelationshipToInsured();
            String relatedInsured = allocation.getRelatedInsured();
            String allocationValue = allocation.getAllocation();
            
            // Save to frroledetails table
            
            // Save Relationship to Insured field
            saveRoleDetail(roleGUID, "Relationship to Insured", relationshipToInsured);
            
            // Save Related Insured field
            saveRoleDetail(roleGUID, "Related Insured", relatedInsured);
            
            // Save Allocation field
            saveRoleDetail(roleGUID, "Allocation", allocationValue);
            
            // Save Type field (primary or contingent)
            saveRoleDetail(roleGUID, "Type", type);
            
            // Save Coverage ID field
            saveRoleDetail(roleGUID, "Coverage ID", coverageId);
            
            log.info("Saved allocation details for beneficiary with roleGUID: {}", roleGUID);
        }
    }
    
    private void saveRoleDetail(String roleGUID, String fieldName, String textValue) {
        // Check if this field already exists
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM frroledetails WHERE RoleGUID = ? AND FieldName = ?",
            Integer.class,
            roleGUID, fieldName
        );
        
        if (count != null && count > 0) {
            // Update existing record
            jdbcTemplate.update(
                "UPDATE frroledetails SET TextValue = ? WHERE RoleGUID = ? AND FieldName = ?",
                textValue, roleGUID, fieldName
            );
        } else {
            // Insert new record
            jdbcTemplate.update(
                "INSERT INTO frroledetails (RoleGUID, FieldName, TextValue) VALUES (?, ?, ?)",
                roleGUID, fieldName, textValue
            );
        }
    }
} 