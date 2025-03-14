package com.backend.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
@Slf4j
public class CoverageService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Save base coverage data
     */
    @Transactional
    public void saveBaseCoverage(Map<String, Object> baseCoverageData, String applicationNumber) {
        log.info("Saving base coverage for application: {}", applicationNumber);
        
        // Get application form GUID
        String applicationFormGUID = getApplicationFormGUID(applicationNumber);
        if (applicationFormGUID == null) {
            throw new RuntimeException("Application form not found for number: " + applicationNumber);
        }
        
        // Get the plan GUID
        String planGUID = (String) baseCoverageData.get("planGUID");
        log.info("Plan GUID: {}", planGUID);
        if (planGUID == null || planGUID.isEmpty()) {
            throw new RuntimeException("PlanGUID is required");
        }
        
        // Get coverage definition GUID for 'Base coverage'
        String coverageDefinitionGUID = getCoverageDefinitionGUID(planGUID);
        if (coverageDefinitionGUID == null) {
            throw new RuntimeException("Coverage definition not found for plan: " + planGUID);
        }
        
        // Generate a new coverage GUID
        String coverageGUID = UUID.randomUUID().toString();
        
        // Insert into frcoverage
        insertCoverage(coverageGUID, applicationFormGUID, coverageDefinitionGUID);
        
        // Handle insureds
        handleInsureds(baseCoverageData, applicationFormGUID, coverageGUID);
        
        // Save all coverage details
        saveCoverageDetails(baseCoverageData, coverageGUID);
        
        log.info("Base coverage saved successfully with CoverageGUID: {}", coverageGUID);
    }
    
    private String getApplicationFormGUID(String applicationNumber) {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT ApplicationFormGUID FROM frapplicationform WHERE ApplicationFormNumber = ?",
                String.class,
                applicationNumber
            );
        } catch (Exception e) {
            log.error("Error getting application form GUID: {}", e.getMessage());
            return null;
        }
    }
    
    private String getCoverageDefinitionGUID(String planGUID) {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT CoverageDefinitionGUID FROM frcoveragedefinition WHERE CoverageName = 'Base coverage' AND PlanGUID = ?",
                String.class,
                planGUID
            );
        } catch (Exception e) {
            log.error("Error getting coverage definition GUID: {}", e.getMessage());
            return null;
        }
    }
    
    private void insertCoverage(String coverageGUID, String applicationFormGUID, String coverageDefinitionGUID) {
        jdbcTemplate.update(
            "INSERT INTO frcoverage (CoverageGUID, ApplicationFormGUID, CoverageDefinitionGUID, StatusCode) VALUES (?, ?, ?, ?)",
            coverageGUID, applicationFormGUID, coverageDefinitionGUID, "01"
        );
    }
    
    private void handleInsureds(Map<String, Object> baseCoverageData, String applicationFormGUID, String coverageGUID) {
        // Handle first insured
        String insured1 = (String) baseCoverageData.get("insured1");
        if (insured1 != null && !insured1.isEmpty()) {
            String clientGUID = getClientGUIDForInsured(insured1);
            if (clientGUID != null) {
                insertRole(clientGUID, applicationFormGUID, coverageGUID);
            }
        }
        
        // Handle second insured if joint coverage
        if ("joint".equals(baseCoverageData.get("coverageType"))) {
            String insured2 = (String) baseCoverageData.get("insured2");
            if (insured2 != null && !insured2.isEmpty()) {
                String clientGUID = getClientGUIDForInsured(insured2);
                if (clientGUID != null) {
                    insertRole(clientGUID, applicationFormGUID, coverageGUID);
                }
            }
        }
    }
    
    private String getClientGUIDForInsured(String insuredId) {
        try {
            // Get client GUID from insured ID (which is likely stored somewhere else)
            return jdbcTemplate.queryForObject(
                "SELECT ClientGUID FROM frclient WHERE ClientGUID = (SELECT ClientGUID FROM frrole WHERE RoleGUID = ?)",
                String.class,
                insuredId
            );
        } catch (Exception e) {
            log.error("Error getting client GUID for insured: {}", e.getMessage());
            return null;
        }
    }
    
    private void insertRole(String clientGUID, String applicationFormGUID, String coverageGUID) {
        String roleGUID = UUID.randomUUID().toString();
        jdbcTemplate.update(
            "INSERT INTO frrole (RoleGUID, RoleCode, ClientGUID, ApplicationFormGUID, CoverageGUID, IssueDate, StatusCode) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            roleGUID, "02", clientGUID, applicationFormGUID, coverageGUID, LocalDate.now(), "01"
        );
    }
    
    private void saveCoverageDetails(Map<String, Object> baseCoverageData, String coverageGUID) {
        // Save face amount
        if (baseCoverageData.containsKey("faceAmount")) {
            Object faceAmount = baseCoverageData.get("faceAmount");
            if (faceAmount != null && !faceAmount.toString().isEmpty()) {
                insertCoverageDetail(coverageGUID, "FaceAmount", parseDecimal(faceAmount.toString()), null, null, null);
            }
        }
        
        // Save table rating
        if (baseCoverageData.containsKey("tableRating")) {
            String tableRating = (String) baseCoverageData.get("tableRating");
            if (tableRating != null && !tableRating.isEmpty()) {
                // Convert percentage to decimal (e.g., 150% becomes 1.5)
                double ratingValue = Double.parseDouble(tableRating.replace("%", "")) / 100.0;
                insertCoverageDetail(coverageGUID, "TableRating", ratingValue, null, null, null);
            }
        }
        
        // Save permanent flat extra
        if (baseCoverageData.containsKey("permanentFlatExtraAmount")) {
            Object permFlatExtra = baseCoverageData.get("permanentFlatExtraAmount");
            if (permFlatExtra != null) {
                insertCoverageDetail(coverageGUID, "PermFlatExtra", null, Integer.parseInt(permFlatExtra.toString()), null, null);
            }
        }
        
        // Save temporary flat extra
        if (baseCoverageData.containsKey("temporaryFlatExtraAmount")) {
            Object tempFlatExtra = baseCoverageData.get("temporaryFlatExtraAmount");
            if (tempFlatExtra != null) {
                insertCoverageDetail(coverageGUID, "TempFlatExtra", null, Integer.parseInt(tempFlatExtra.toString()), null, null);
            }
        }
        
        // Save temporary flat extra duration
        if (baseCoverageData.containsKey("temporaryFlatExtraDuration")) {
            Object tempFlatExtraDuration = baseCoverageData.get("temporaryFlatExtraDuration");
            if (tempFlatExtraDuration != null) {
                insertCoverageDetail(coverageGUID, "TempFlatExtraDuration", null, Integer.parseInt(tempFlatExtraDuration.toString()), null, null);
            }
        }
        
        // Save underwriting class
        if (baseCoverageData.containsKey("underwritingClass")) {
            String uwClass = (String) baseCoverageData.get("underwritingClass");
            if (uwClass != null && !uwClass.isEmpty()) {
                // Map underwriting class to code
                String uwClassCode = mapUnderwritingClassToCode(uwClass);
                insertCoverageDetail(coverageGUID, "UWClass", null, null, uwClassCode, null);
            }
        }
    }
    
    private Double parseDecimal(String value) {
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    private void insertCoverageDetail(String coverageGUID, String fieldName, Double decimalValue, 
                                     Integer integerValue, String textValue, LocalDate dateValue) {
        jdbcTemplate.update(
            "INSERT INTO frcoveragedetails (CoverageGUID, FieldName, DecimalValue, IntegerValue, TextValue, DateValue) " +
            "VALUES (?, ?, ?, ?, ?, ?)",
            coverageGUID, fieldName, decimalValue, integerValue, textValue, dateValue
        );
    }
    
    private String mapUnderwritingClassToCode(String uwClass) {
        return switch (uwClass) {
            case "Standard" -> "01";
            case "Standard Plus" -> "02";
            case "Preferred" -> "03";
            case "Preferred Plus" -> "04";
            default -> "01"; // Default to Standard
        };
    }
} 