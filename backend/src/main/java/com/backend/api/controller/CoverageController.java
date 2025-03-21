package com.backend.api.controller;

import com.backend.api.service.CoverageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/coverage")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Slf4j
public class CoverageController {
    
    @Autowired
    private CoverageService coverageService;
    
    @PostMapping("/base/{applicationNumber}")
    public ResponseEntity<Map<String, Object>> saveBaseCoverage(
            @PathVariable String applicationNumber,
            @RequestBody Map<String, Object> baseCoverageData) {
        log.info("Received request to save base coverage for application: {}", applicationNumber);
        Map<String, Object> savedData = coverageService.saveBaseCoverage(baseCoverageData, applicationNumber);
        return ResponseEntity.ok(savedData);
    }
} 