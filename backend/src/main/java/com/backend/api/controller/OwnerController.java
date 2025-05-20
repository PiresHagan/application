package com.backend.api.controller;

import com.backend.api.dto.OwnerSaveRequest;
import com.backend.api.dto.OwnerSaveResponse;
import com.backend.api.service.OwnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/owners")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Slf4j
public class OwnerController {
    
    @Autowired
    private OwnerService ownerService;
    
    @PostMapping
    public ResponseEntity<OwnerSaveResponse> saveOwners(@RequestBody OwnerSaveRequest request) {
        log.info("Received owner save request: {}", request);
        OwnerSaveResponse response = ownerService.saveOwners(request);
        return ResponseEntity.ok(response);
    }
} 