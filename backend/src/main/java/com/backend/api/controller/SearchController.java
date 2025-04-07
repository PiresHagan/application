package com.backend.api.controller;

import com.backend.api.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class SearchController {
    
    private final SearchService searchService;
    
    @GetMapping("/application")
    public ResponseEntity<Map<String, Object>> searchApplications(
            @RequestParam(required = false) String applicationNumber,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) String ownerType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Search request received - applicationNumber: {}, firstName: {}, lastName: {}, companyName: {}, ownerType: {}, page: {}, size: {}", 
                applicationNumber, firstName, lastName, companyName, ownerType, page, size);
        
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> results;
        long totalItems = 0;
        
        if (applicationNumber != null && !applicationNumber.isEmpty()) {
            results = searchService.searchByApplicationNumber(applicationNumber, page, size);
            totalItems = searchService.countByApplicationNumber(applicationNumber);
        } else if (ownerType != null && ownerType.equals("individual")) {
            results = searchService.searchByIndividualOwner(firstName, lastName, page, size);
            totalItems = searchService.countByIndividualOwner(firstName, lastName);
        } else if (ownerType != null && ownerType.equals("corporate")) {
            results = searchService.searchByCorporateOwner(companyName, page, size);
            totalItems = searchService.countByCorporateOwner(companyName);
        } else {
            results = searchService.getAllApplications(page, size);
            totalItems = searchService.countAllApplications();
        }
        
        int totalPages = (int) Math.ceil((double) totalItems / size);
        
        response.put("content", results);
        response.put("currentPage", page);
        response.put("totalItems", totalItems);
        response.put("totalPages", totalPages);
        
        log.info("Search results: found {} total items, returning page {} of {}", totalItems, page, totalPages);
        
        return ResponseEntity.ok(response);
    }
} 