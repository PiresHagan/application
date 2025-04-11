package com.backend.api.service;

import com.backend.api.dto.ProductDto;
import com.backend.api.dto.PlanDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
@Transactional
@Slf4j
public class ProductService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public List<Map<String, Object>> getProductsByCompany(String companyName) {
        log.info("Getting products for company: {}", companyName);
        
        String sql = "SELECT p.ProductGUID, p.ProductName, p.ProductCode " +
                    "FROM frproduct p " +
                    "JOIN frcompany c ON c.CompanyGUID = p.CompanyGUID " +
                    "WHERE c.CompanyName = ?";
        
        List<Map<String, Object>> products = jdbcTemplate.queryForList(sql, companyName);
        log.info("Found {} products for company {}", products.size(), companyName);
        
        return products;
    }
    
    public List<Map<String, Object>> getPlansByProduct(String productGUID) {
        log.info("Getting plans for product: {}", productGUID);
        
        String sql = "SELECT PlanGUID, PlanName, PlanCode " +
                    "FROM frplan " +
                    "WHERE ProductGUID = ?";
        
        List<Map<String, Object>> plans = jdbcTemplate.queryForList(sql, productGUID);
        log.info("Found {} plans for product {}", plans.size(), productGUID);
        
        return plans;
    }
    
    public void updateApplicationFormPlan(String applicationFormNumber, String planGUID) {
        log.info("Updating application form {} with plan: {}", applicationFormNumber, planGUID);
        
        String sql = "UPDATE frapplicationform SET PlanGUID = ? WHERE ApplicationFormNumber = ?";
        
        int rowsUpdated = jdbcTemplate.update(sql, planGUID, applicationFormNumber);
        log.info("Updated {} rows in frapplicationform", rowsUpdated);
    }
} 