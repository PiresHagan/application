package com.backend.api.controller;

import com.backend.api.entity.User;
import com.backend.api.entity.UserRole;
import com.backend.api.repository.UserRepository;
import com.backend.api.security.SecurityUtils;
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
    private final UserRepository userRepository;
    
    @GetMapping("/application")
    public ResponseEntity<Map<String, Object>> searchApplications(
            @RequestParam(required = false) String applicationNumber,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) String ownerType,
            @RequestParam(defaultValue = "false") boolean currentUserOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Search request received - applicationNumber: {}, firstName: {}, lastName: {}, companyName: {}, ownerType: {}, currentUserOnly: {}, page: {}, size: {}", 
                applicationNumber, firstName, lastName, companyName, ownerType, currentUserOnly, page, size);
        
        String currentUserEmail = SecurityUtils.getCurrentUsername();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        if (currentUser.getRole() != UserRole.ADMIN) {
            currentUserOnly = true;
            log.info("Non-admin user, restricting to current user's applications");
        }
        
        if (currentUserOnly) {
            log.info("Restricting search to current user: {}", currentUserEmail);
        }
        
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> results;
        long totalItems = 0;
        
        if (applicationNumber != null && !applicationNumber.isEmpty()) {
            results = searchService.searchByApplicationNumber(applicationNumber, page, size, currentUserOnly ? currentUserEmail : null);
            totalItems = searchService.countByApplicationNumber(applicationNumber, currentUserOnly ? currentUserEmail : null);
        } else if (ownerType != null && ownerType.equals("individual")) {
            results = searchService.searchByIndividualOwner(firstName, lastName, page, size, currentUserOnly ? currentUserEmail : null);
            totalItems = searchService.countByIndividualOwner(firstName, lastName, currentUserOnly ? currentUserEmail : null);
        } else if (ownerType != null && ownerType.equals("corporate")) {
            results = searchService.searchByCorporateOwner(companyName, page, size, currentUserOnly ? currentUserEmail : null);
            totalItems = searchService.countByCorporateOwner(companyName, currentUserOnly ? currentUserEmail : null);
        } else {
            if (currentUserOnly && currentUserEmail != null) {
                results = searchService.getApplicationsByAgent(currentUserEmail, page, size);
                totalItems = searchService.countApplicationsByAgent(currentUserEmail);
            } else {
                results = searchService.getAllApplications(page, size);
                totalItems = searchService.countAllApplications();
            }
        }
        
        int totalPages = (int) Math.ceil((double) totalItems / size);
        
        response.put("content", results);
        response.put("currentPage", page);
        response.put("totalItems", totalItems);
        response.put("totalPages", totalPages);
        
        log.info("Search results: found {} total items, returning page {} of {}", totalItems, page, totalPages);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/application/my")
    public ResponseEntity<Map<String, Object>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        String currentUserEmail = SecurityUtils.getCurrentUsername();
        log.info("Getting applications for current user: {} (page: {}, size: {})", currentUserEmail, page, size);
        
        Map<String, Object> response = new HashMap<>();
        
        if (currentUserEmail == null) {
            response.put("content", List.of());
            response.put("currentPage", page);
            response.put("totalItems", 0);
            response.put("totalPages", 0);
            return ResponseEntity.ok(response);
        }
        
        List<Map<String, Object>> results = searchService.getApplicationsByAgent(currentUserEmail, page, size);
        long totalItems = searchService.countApplicationsByAgent(currentUserEmail);
        int totalPages = (int) Math.ceil((double) totalItems / size);
        
        response.put("content", results);
        response.put("currentPage", page);
        response.put("totalItems", totalItems);
        response.put("totalPages", totalPages);
        
        log.info("My applications results: found {} total items, returning page {} of {}", totalItems, page, totalPages);
        
        return ResponseEntity.ok(response);
    }
} 