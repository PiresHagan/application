package com.backend.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@Slf4j
public class PremiumCalculationService {

    public JsonNode calculatePremium(JsonNode requestJson) {
        log.info("Calculating premium for request");
        Map<String, List<String>> applicationLevelCollection = new HashMap<>();
        Map<String, Map<String, List<String>>> coverageLevelCollection = new HashMap<>();

        buildInputCollections(requestJson, applicationLevelCollection, coverageLevelCollection);
        
        Map<String, Object> premiumResults = calculate(applicationLevelCollection, coverageLevelCollection);
        
        return buildJsonResult(premiumResults);
    }

    private void buildInputCollections(JsonNode requestJson,
                                       Map<String, List<String>> applicationLevelCollection,
                                       Map<String, Map<String, List<String>>> coverageLevelCollection) {
        String applicationFormGUID = requestJson.path("application").path("ApplicationFormGUID").asText();
        String planGUID = requestJson.path("application").path("PlanGUID").asText();

        addToCollection(applicationLevelCollection, "ApplicationFormGUID", applicationFormGUID);
        addToCollection(applicationLevelCollection, "PlanGUID", planGUID);

        JsonNode roles = requestJson.path("application").path("roles");
        if (roles.isArray()) {
            for (JsonNode roleNode : roles) {
                String roleGUID = roleNode.path("RoleGUID").asText();
                String roleCode = roleNode.path("RoleCode").asText();

                JsonNode client = roleNode.path("client");
                String clientGUID = client.path("ClientGUID").asText();
                String clientName = client.path("ClientName").asText();
                String companyName = client.path("CompanyName").asText("");
                String gender = client.path("Gender").asText();
                String tobacco = client.path("Tobacco").asText();
                String countryCode = client.path("CountryCode").asText();
                String stateCode = client.path("StateCode").asText();
                String dateOfBirth = client.path("DateOfBirth").asText();
                String typeCode = client.path("TypeCode").asText();

                addToCollection(applicationLevelCollection, applicationFormGUID + "_RoleGUID", roleGUID);
                addToCollection(applicationLevelCollection, applicationFormGUID + "_RoleCode", roleCode);
                addToCollection(applicationLevelCollection, applicationFormGUID + "_ClientGUID", clientGUID);
                addToCollection(applicationLevelCollection, applicationFormGUID + "_ClientName", clientName);
                addToCollection(applicationLevelCollection, applicationFormGUID + "_CompanyName", companyName);
                addToCollection(applicationLevelCollection, applicationFormGUID + "_Gender", gender);
                addToCollection(applicationLevelCollection, applicationFormGUID + "_Tobacco", tobacco);
                addToCollection(applicationLevelCollection, applicationFormGUID + "_CountryCode", countryCode);
                addToCollection(applicationLevelCollection, applicationFormGUID + "_StateCode", stateCode);
                addToCollection(applicationLevelCollection, applicationFormGUID + "_DateOfBirth", dateOfBirth);
                addToCollection(applicationLevelCollection, applicationFormGUID + "_TypeCode", typeCode);
            }
        }

        JsonNode coverages = requestJson.path("application").path("coverages");
        if (coverages.isArray()) {
            for (JsonNode coverage : coverages) {
                String coverageGUID = coverage.path("CoverageGUID").asText();
                Map<String, List<String>> coverageMap = new HashMap<>();

                String coverageDefinitionGUID = coverage.path("CoverageDefinitionGUID").asText();
                JsonNode details = coverage.path("coveragedetails");

                addToCollection(coverageMap, coverageGUID + "_CoverageDefinition", coverageDefinitionGUID);
                addToCollection(coverageMap, coverageGUID + "_FaceAmount", details.path("FaceAmount").asText());
                addToCollection(coverageMap, coverageGUID + "_TableRating", details.path("TableRating").asText());
                addToCollection(coverageMap, coverageGUID + "_PermFlat", details.path("PermFlat").asText());
                addToCollection(coverageMap, coverageGUID + "_TempFlat", details.path("TempFlat").asText());
                addToCollection(coverageMap, coverageGUID + "_TempFlatDuration", details.path("TempFlatDuration").asText());
                addToCollection(coverageMap, coverageGUID + "_UWClass", details.path("UWClass").asText());

                JsonNode coverageRoles = coverage.path("roles");
                if (coverageRoles.isArray()) {
                    for (JsonNode roleNode : coverageRoles) {
                        String roleGUID = roleNode.path("RoleGUID").asText();
                        String roleCode = roleNode.path("RoleCode").asText();

                        JsonNode client = roleNode.path("client");
                        String clientGUID = client.path("ClientGUID").asText();
                        String clientName = client.path("ClientName").asText();
                        String companyName = client.path("CompanyName").asText("");
                        String gender = client.path("Gender").asText();
                        String tobacco = client.path("Tobacco").asText();
                        String countryCode = client.path("CountryCode").asText();
                        String stateCode = client.path("StateCode").asText();
                        String dateOfBirth = client.path("DateOfBirth").asText();
                        String typeCode = client.path("TypeCode").asText();

                        addToCollection(coverageMap, coverageGUID + "_RoleGUID", roleGUID);
                        addToCollection(coverageMap, coverageGUID + "_RoleCode", roleCode);
                        addToCollection(coverageMap, coverageGUID + "_ClientGUID", clientGUID);
                        addToCollection(coverageMap, coverageGUID + "_ClientName", clientName);
                        addToCollection(coverageMap, coverageGUID + "_CompanyName", companyName);
                        addToCollection(coverageMap, coverageGUID + "_Gender", gender);
                        addToCollection(coverageMap, coverageGUID + "_Tobacco", tobacco);
                        addToCollection(coverageMap, coverageGUID + "_CountryCode", countryCode);
                        addToCollection(coverageMap, coverageGUID + "_StateCode", stateCode);
                        addToCollection(coverageMap, coverageGUID + "_DateOfBirth", dateOfBirth);
                        addToCollection(coverageMap, coverageGUID + "_TypeCode", typeCode);
                    }
                }

                coverageLevelCollection.put(coverageGUID, coverageMap);
            }
        }
    }

    private Map<String, Object> calculate(Map<String, List<String>> appLevel, Map<String, Map<String, List<String>>> covLevel) {
        Map<String, Object> result = new HashMap<>();

        String applicationGUID = getFirst(appLevel, "ApplicationFormGUID");
        log.info("Calculating premium for application: {}", applicationGUID);

        BigDecimal totalAnnual = BigDecimal.ZERO;
        BigDecimal totalMonthly = BigDecimal.ZERO;
        BigDecimal totalQuarterly = BigDecimal.ZERO;
        BigDecimal totalSemiAnnual = BigDecimal.ZERO;

        for (Map.Entry<String, Map<String, List<String>>> entry : covLevel.entrySet()) {
            String coverageGUID = entry.getKey();
            Map<String, List<String>> coverage = entry.getValue();

            String faceAmountStr = getFirst(coverage, coverageGUID + "_FaceAmount");
            if (faceAmountStr.isEmpty()) {
                log.warn("Missing face amount for coverage: {}", coverageGUID);
                continue;
            }
            
            BigDecimal faceAmount = new BigDecimal(faceAmountStr);
            
            BigDecimal annual = faceAmount.divide(BigDecimal.valueOf(52), 2, RoundingMode.HALF_UP);
            BigDecimal monthly = faceAmount.divide(BigDecimal.valueOf(624), 2, RoundingMode.HALF_UP);
            BigDecimal quarterly = faceAmount.divide(BigDecimal.valueOf(208), 2, RoundingMode.HALF_UP);
            BigDecimal semiAnnual = faceAmount.divide(BigDecimal.valueOf(104), 2, RoundingMode.HALF_UP);
            
            result.put(coverageGUID + "_premium", annual);
            
            totalAnnual = totalAnnual.add(annual);
            totalMonthly = totalMonthly.add(monthly);
            totalQuarterly = totalQuarterly.add(quarterly);
            totalSemiAnnual = totalSemiAnnual.add(semiAnnual);
        }

        result.put(applicationGUID + "_totalAnnualPremium", totalAnnual);
        result.put(applicationGUID + "_totalMonthlyPremium", totalMonthly);
        result.put(applicationGUID + "_totalQuarterlyPremium", totalQuarterly);
        result.put(applicationGUID + "_totalSemiAnnualPremium", totalSemiAnnual);

        return result;
    }
    
    private boolean isCoverageDerivedFromBase(Map<String, List<String>> coverage) {
        String defGuid = getFirst(coverage, coverage.keySet().stream()
                .filter(s -> s.endsWith("_CoverageDefinition"))
                .findFirst()
                .orElse(""));
        
        return defGuid.contains("base") || defGuid.contains("Base");
    }
    
    private BigDecimal getUnderwritingFactor(String uwClass) {
        switch (uwClass) {
            case "01":
                return new BigDecimal("1.0");
            case "02": 
                return new BigDecimal("0.9");
            case "03": 
                return new BigDecimal("0.8");
            case "04": 
                return new BigDecimal("0.7");
            default:
                return new BigDecimal("1.0");
        }
    }

    private String getFirst(Map<String, List<String>> map, String key) {
        List<String> values = map.getOrDefault(key, List.of());
        return values.isEmpty() ? "" : values.get(0);
    }

    private JsonNode buildJsonResult(Map<String, Object> premiumResults) {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode resultNode = mapper.createObjectNode();

        for (Map.Entry<String, Object> entry : premiumResults.entrySet()) {
            if (entry.getValue() instanceof BigDecimal) {
                resultNode.put(entry.getKey(), ((BigDecimal) entry.getValue()).doubleValue());
            } else {
                resultNode.put(entry.getKey(), entry.getValue().toString());
            }
        }
        return resultNode;
    }

    private void addToCollection(Map<String, List<String>> map, String key, String value) {
        map.computeIfAbsent(key, k -> new ArrayList<>()).add(value);
    }
} 