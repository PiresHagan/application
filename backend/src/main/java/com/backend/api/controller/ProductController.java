package com.backend.api.controller;

import com.backend.api.dto.PlanUpdateRequest;
import com.backend.api.service.ProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Slf4j
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @GetMapping("/company/{companyName}")
    public ResponseEntity<List<Map<String, Object>>> getProductsByCompany(@PathVariable String companyName) {
        log.info("Received request to get products for company: {}", companyName);
        return ResponseEntity.ok(productService.getProductsByCompany(companyName));
    }
    
    @GetMapping("/{productGUID}/plans")
    public ResponseEntity<List<Map<String, Object>>> getPlansByProduct(@PathVariable String productGUID) {
        log.info("Received request to get plans for product: {}", productGUID);
        return ResponseEntity.ok(productService.getPlansByProduct(productGUID));
    }
    
    @PutMapping("/application/{applicationNumber}/plan")
    public ResponseEntity<Void> updateApplicationPlan(
            @PathVariable String applicationNumber,
            @RequestBody PlanUpdateRequest request) {
        log.info("Received request to update application {} with plan: {}", applicationNumber, request.getPlanGUID());
        productService.updateApplicationFormPlan(applicationNumber, request.getPlanGUID());
        return ResponseEntity.ok().build();
    }
} 