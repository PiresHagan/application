package com.backend.api.controller;

import com.backend.api.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class SearchController {
    
    private final SearchService searchService;
    
    @GetMapping("/application")
    public ResponseEntity<List<Map<String, Object>>> searchApplications(
            @RequestParam(required = false) String applicationNumber,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) String ownerType) {
        
        log.info("Search request received - applicationNumber: {}, firstName: {}, lastName: {}, companyName: {}, ownerType: {}", 
                applicationNumber, firstName, lastName, companyName, ownerType);
        
        List<Map<String, Object>> results;
        
        if (applicationNumber != null && !applicationNumber.isEmpty()) {
            results = searchService.searchByApplicationNumber(applicationNumber);
            log.info("Search results: {}", results);
        } else if (ownerType != null && ownerType.equals("individual")) {
            results = searchService.searchByIndividualOwner(firstName, lastName);
            log.info("Search results: {}", results);
        } else if (ownerType != null && ownerType.equals("corporate")) {
            results = searchService.searchByCorporateOwner(companyName);
            log.info("Search results: {}", results);
        } else {
            results = searchService.getAllApplications();
            log.info("Search results: {}", results);
        }
        
        return ResponseEntity.ok(results);
    }
} 