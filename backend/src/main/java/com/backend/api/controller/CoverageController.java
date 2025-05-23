package com.backend.api.controller;

import com.backend.api.service.CoverageService;
import com.backend.api.service.PremiumCalculationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/coverage")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Slf4j
public class CoverageController {
    
    @Autowired
    private CoverageService coverageService;
    
    @Autowired
    private PremiumCalculationService premiumCalculationService;
    
    @PostMapping("/base/{applicationNumber}")
    public ResponseEntity<Map<String, Object>> saveBaseCoverage(
            @PathVariable String applicationNumber,
            @RequestBody Map<String, Object> baseCoverageData) {
        log.info("Received request to save base coverage for application: {}", applicationNumber);
        Map<String, Object> savedData = coverageService.saveBaseCoverage(baseCoverageData, applicationNumber);
        return ResponseEntity.ok(savedData);
    }
    
    @PostMapping("/premium/calculate")
    public ResponseEntity<JsonNode> calculatePremium(@RequestBody JsonNode requestData) {
        log.info("Received request to calculate premium: {}", requestData);
        try {
            JsonNode calculationResult = premiumCalculationService.calculatePremium(requestData);
            log.info("calculationResult: {}", calculationResult);
            return ResponseEntity.ok(calculationResult);
        } catch (Exception e) {
            log.error("Error calculating premium: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(JsonNodeFactory.instance.objectNode()
                .put("error", "Failed to calculate premium: " + e.getMessage()));
        }
    }

    @GetMapping("/additional-definitions/{planGUID}")
    public ResponseEntity<List<Map<String, String>>> getAdditionalCoverageDefinitions(
            @PathVariable String planGUID) {
        log.info("Fetching additional coverage definitions for plan: {}", planGUID);
        List<Map<String, String>> definitions = coverageService.getAdditionalCoverageDefinitions(planGUID);
        return ResponseEntity.ok(definitions);
    }
    
    @PostMapping("/premium/{applicationNumber}")
    public ResponseEntity<Map<String, String>> savePremiumData(
            @PathVariable String applicationNumber,
            @RequestBody Map<String, Object> premiumData) {
        log.info("Received request to save premium data for application: {}", applicationNumber);
        try {
            coverageService.savePremiumData(applicationNumber, premiumData);
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Premium data saved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error saving premium data: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to save premium data: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
} 