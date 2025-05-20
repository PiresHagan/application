package com.backend.api.controller;

import com.backend.api.dto.BeneficiaryAllocationRequest;
import com.backend.api.service.BeneficiaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/beneficiaries")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Slf4j
public class BeneficiaryController {
    
    @Autowired
    private BeneficiaryService beneficiaryService;
    
    @PostMapping("/allocations")
    public ResponseEntity<Void> saveBeneficiaryAllocations(@RequestBody BeneficiaryAllocationRequest request) {
        log.info("Received beneficiary allocation request: {}", request);
        beneficiaryService.saveBeneficiaryAllocations(request);
        return ResponseEntity.ok().build();
    }
} 