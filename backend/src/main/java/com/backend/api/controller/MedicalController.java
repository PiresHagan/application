package com.backend.api.controller;

import com.backend.api.service.MedicalService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/medical")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Slf4j
public class MedicalController {
    
    @Autowired
    private MedicalService medicalService;
    
    @PostMapping("/save/{roleGUID}")
    public ResponseEntity<Map<String, String>> saveMedicalData(
            @PathVariable String roleGUID,
            @RequestBody Map<String, Object> medicalData) {
        log.info("Received request to save medical data for role: {}", roleGUID);
        medicalService.saveMedicalData(roleGUID, medicalData);
        return ResponseEntity.ok(Map.of("status", "success"));
    }
} 