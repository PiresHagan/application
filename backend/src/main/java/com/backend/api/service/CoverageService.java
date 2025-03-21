package com.backend.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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
    public Map<String, Object> saveBaseCoverage(Map<String, Object> baseCoverageData, String applicationNumber) {
        log.info("Saving base coverage for application: {}", baseCoverageData);
        
        // Create a result map to store all created GUIDs and data
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> insuredRoles = new ArrayList<>();
        
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
        Map<String, String> insuredRolesMap = handleInsureds(baseCoverageData, applicationFormGUID, coverageGUID);
        
        // Save all coverage details
        saveCoverageDetails(baseCoverageData, coverageGUID);
        
        // Add created GUIDs to result map
        result.put("coverageGUID", coverageGUID);
        result.put("coverageDefinitionGUID", coverageDefinitionGUID);
        result.put("applicationFormGUID", applicationFormGUID);
        result.put("planGUID", planGUID);
        
        // Add insured roles to result
        for (Map.Entry<String, String> entry : insuredRolesMap.entrySet()) {
            Map<String, Object> roleInfo = new HashMap<>();
            roleInfo.put("insuredId", entry.getKey());
            roleInfo.put("roleGUID", entry.getValue());
            insuredRoles.add(roleInfo);
        }
        result.put("insuredRoles", insuredRoles);
        
        log.info("Base coverage saved successfully with CoverageGUID: {}", coverageGUID);
        return result;
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
    
    private Map<String, String> handleInsureds(Map<String, Object> baseCoverageData, String applicationFormGUID, String coverageGUID) {
        Map<String, String> insuredRolesMap = new HashMap<>();
        
        // Handle first insured
        Object insured1Obj = baseCoverageData.get("insured1");
        Boolean insured1IsSameAsOwner = (Boolean) baseCoverageData.getOrDefault("insured1IsSameAsOwner", false);
        
        if (insured1Obj != null) {
            // Convert insured ID to string regardless of whether it's an Integer or String
            String insured1 = String.valueOf(insured1Obj);
            
            if (!insured1.isEmpty()) {
                // Get client GUID (this method should be updated to directly get client GUID)
                String clientGUID = getClientGUID(insured1);
                
                if (clientGUID != null) {
                    // Insert role based on whether insured is same as owner or new
                    String roleGUID;
                    if (Boolean.TRUE.equals(insured1IsSameAsOwner)) {
                        // For owner-insureds, insert role with ApplicationFormGUID as null
                        roleGUID = insertOwnerInsuredRole(clientGUID, applicationFormGUID, coverageGUID);
                        log.info("Insured 1 is same as owner, inserted role for ClientGUID: {}", clientGUID);
                    } else {
                        // For new insureds, insert role with ApplicationFormGUID value
                        roleGUID = insertNewInsuredRole(clientGUID, applicationFormGUID, coverageGUID);
                        log.info("Insured 1 is a new insured, inserted role for ClientGUID: {}", clientGUID);
                    }
                    insuredRolesMap.put(insured1, roleGUID);
                }
            }
        }
        
        // Handle second insured if joint coverage
        if ("joint".equals(baseCoverageData.get("coverageType"))) {
            Object insured2Obj = baseCoverageData.get("insured2");
            Boolean insured2IsSameAsOwner = (Boolean) baseCoverageData.getOrDefault("insured2IsSameAsOwner", false);
            
            if (insured2Obj != null) {
                // Convert insured ID to string regardless of whether it's an Integer or String
                String insured2 = String.valueOf(insured2Obj);
                
                if (!insured2.isEmpty()) {
                    // Get client GUID
                    String clientGUID = getClientGUID(insured2);
                    
                    if (clientGUID != null) {
                        // Insert role based on whether insured is same as owner or new
                        String roleGUID;
                        if (Boolean.TRUE.equals(insured2IsSameAsOwner)) {
                            // For owner-insureds, insert role with ApplicationFormGUID as null
                            roleGUID = insertOwnerInsuredRole(clientGUID, applicationFormGUID, coverageGUID);
                            log.info("Insured 2 is same as owner, inserted role for ClientGUID: {}", clientGUID);
                        } else {
                            // For new insureds, insert role with ApplicationFormGUID value
                            roleGUID = insertNewInsuredRole(clientGUID, applicationFormGUID, coverageGUID);
                            log.info("Insured 2 is a new insured, inserted role for ClientGUID: {}", clientGUID);
                        }
                        insuredRolesMap.put(insured2, roleGUID);
                    }
                }
            }
        }
        
        return insuredRolesMap;
    }
    
    // Simplified method to just get the clientGUID directly
    private String getClientGUID(String insuredId) {
        try {
            // Try to get the client GUID from the role 
            return jdbcTemplate.queryForObject(
                "SELECT ClientGUID FROM frrole WHERE RoleGUID = ?",
                String.class,
                insuredId
            );
        } catch (Exception ex) {
            log.error("Error getting client GUID for insured ID {}: {}", insuredId, ex.getMessage());
            return null;
        }
    }
    
    // For insureds who are the same as owners
    private String insertOwnerInsuredRole(String clientGUID, String applicationFormGUID, String coverageGUID) {
        String roleGUID = UUID.randomUUID().toString();
        jdbcTemplate.update(
            "INSERT INTO frrole (RoleGUID, RoleCode, ClientGUID, ApplicationFormGUID, CoverageGUID, IssueDate, StatusCode) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            roleGUID, "02", clientGUID, null, coverageGUID, LocalDate.now(), "01"
        );
        log.info("Inserted owner-insured role for ClientGUID: {}", clientGUID);
        return roleGUID;
    }
    
    // For new insureds who are not owners
    private String insertNewInsuredRole(String clientGUID, String applicationFormGUID, String coverageGUID) {
        String roleGUID = UUID.randomUUID().toString();
        jdbcTemplate.update(
            "INSERT INTO frrole (RoleGUID, RoleCode, ClientGUID, ApplicationFormGUID, CoverageGUID, IssueDate, StatusCode) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            roleGUID, "02", clientGUID, applicationFormGUID, coverageGUID, LocalDate.now(), "01"
        );
        log.info("Inserted new insured role for ClientGUID: {}", clientGUID);
        return roleGUID;
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
        String code;
        switch (uwClass) {
            case "Standard":
                code = "01";
                break;
            case "Standard Plus":
                code = "02";
                break;
            case "Preferred":
                code = "03";
                break;
            case "Preferred Plus":
                code = "04";
                break;
            default:
                code = "01"; // Default to Standard
                break;
        }
        return code;
    }
} 