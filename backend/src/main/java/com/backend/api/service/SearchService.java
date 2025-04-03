package com.backend.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class SearchService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> searchByApplicationNumber(String applicationNumber) {
        log.info("Searching for application with number: {}", applicationNumber);

        String sql = """
            SELECT 
                af.ApplicationFormNumber as applicationNumber, 
                c.FirstName as firstName, 
                c.LastName as lastName, 
                c.CompanyName as companyName,
                c.DateOfBirth as dateOfBirth,
                CONCAT(COALESCE(ad.AddressLine1, ''), 
                      CASE WHEN ad.City IS NOT NULL THEN CONCAT(', ', ad.City) ELSE '' END,
                      CASE WHEN ad.StateCode IS NOT NULL THEN CONCAT(', ', ad.StateCode) ELSE '' END,
                      CASE WHEN ad.ZipCode IS NOT NULL THEN CONCAT(' ', ad.ZipCode) ELSE '' END) as primaryAddress,
                af.LastModifiedDate as lastModifiedDate,
                r.StatusCode as status,
                c.TypeCode as ownerType
            FROM frapplicationform af
            JOIN frrole r ON af.ApplicationFormGUID = r.ApplicationFormGUID
            JOIN frclient c ON r.ClientGUID = c.ClientGUID
            LEFT JOIN fraddress a ON c.ClientGUID = a.ClientGUID AND a.TypeCode = '01'
            LEFT JOIN fraddressdetails ad ON a.AddressGUID = ad.AddressGUID
            WHERE af.ApplicationFormNumber LIKE ? AND r.RoleCode = '01'
            ORDER BY af.LastModifiedDate DESC
        """;

        return executeQuery(sql, "%" + applicationNumber + "%");
    }

    public List<Map<String, Object>> searchByIndividualOwner(String firstName, String lastName) {
        log.info("Searching for applications with individual owner - firstName: {}, lastName: {}", firstName, lastName);

        String sql = """
            SELECT 
                af.ApplicationFormNumber as applicationNumber, 
                c.FirstName as firstName, 
                c.LastName as lastName,
                c.DateOfBirth as dateOfBirth,
                CONCAT(COALESCE(ad.AddressLine1, ''), 
                      CASE WHEN ad.City IS NOT NULL THEN CONCAT(', ', ad.City) ELSE '' END,
                      CASE WHEN ad.StateCode IS NOT NULL THEN CONCAT(', ', ad.StateCode) ELSE '' END,
                      CASE WHEN ad.ZipCode IS NOT NULL THEN CONCAT(' ', ad.ZipCode) ELSE '' END) as primaryAddress,
                af.LastModifiedDate as lastModifiedDate,
                r.StatusCode as status,
                '01' as ownerType
            FROM frapplicationform af
            JOIN frrole r ON af.ApplicationFormGUID = r.ApplicationFormGUID
            JOIN frclient c ON r.ClientGUID = c.ClientGUID
            LEFT JOIN fraddress a ON c.ClientGUID = a.ClientGUID AND a.TypeCode = '01'
            LEFT JOIN fraddressdetails ad ON a.AddressGUID = ad.AddressGUID
            WHERE r.RoleCode = '01' 
            AND c.TypeCode = '01'
            AND (c.FirstName LIKE ? OR c.LastName LIKE ?)
            ORDER BY af.LastModifiedDate DESC
        """;

        return executeQuery(sql, 
            firstName != null && !firstName.isEmpty() ? "%" + firstName + "%" : "%",
            lastName != null && !lastName.isEmpty() ? "%" + lastName + "%" : "%"
        );
    }

    public List<Map<String, Object>> searchByCorporateOwner(String companyName) {
        log.info("Searching for applications with corporate owner - companyName: {}", companyName);

        String sql = """
            SELECT 
                af.ApplicationFormNumber as applicationNumber, 
                c.CompanyName as companyName,
                CONCAT(COALESCE(ad.AddressLine1, ''), 
                      CASE WHEN ad.City IS NOT NULL THEN CONCAT(', ', ad.City) ELSE '' END,
                      CASE WHEN ad.StateCode IS NOT NULL THEN CONCAT(', ', ad.StateCode) ELSE '' END,
                      CASE WHEN ad.ZipCode IS NOT NULL THEN CONCAT(' ', ad.ZipCode) ELSE '' END) as primaryAddress,
                af.LastModifiedDate as lastModifiedDate,
                r.StatusCode as status,
                '02' as ownerType
            FROM frapplicationform af
            JOIN frrole r ON af.ApplicationFormGUID = r.ApplicationFormGUID
            JOIN frclient c ON r.ClientGUID = c.ClientGUID
            LEFT JOIN fraddress a ON c.ClientGUID = a.ClientGUID AND a.TypeCode = '01'
            LEFT JOIN fraddressdetails ad ON a.AddressGUID = ad.AddressGUID
            WHERE r.RoleCode = '01' 
            AND c.TypeCode = '02'
            AND c.CompanyName LIKE ?
            ORDER BY af.LastModifiedDate DESC
        """;

        return executeQuery(sql, "%" + companyName + "%");
    }

    public List<Map<String, Object>> getAllApplications() {
        log.info("Retrieving all applications");

        String sql = """
            SELECT 
                af.ApplicationFormNumber as applicationNumber, 
                c.FirstName as firstName, 
                c.LastName as lastName, 
                c.CompanyName as companyName,
                c.DateOfBirth as dateOfBirth,
                CONCAT(COALESCE(ad.AddressLine1, ''), 
                      CASE WHEN ad.City IS NOT NULL THEN CONCAT(', ', ad.City) ELSE '' END,
                      CASE WHEN ad.StateCode IS NOT NULL THEN CONCAT(', ', ad.StateCode) ELSE '' END,
                      CASE WHEN ad.ZipCode IS NOT NULL THEN CONCAT(' ', ad.ZipCode) ELSE '' END) as primaryAddress,
                af.LastModifiedDate as lastModifiedDate,
                r.StatusCode as status,
                c.TypeCode as ownerType
            FROM frapplicationform af
            JOIN frrole r ON af.ApplicationFormGUID = r.ApplicationFormGUID
            JOIN frclient c ON r.ClientGUID = c.ClientGUID
            LEFT JOIN fraddress a ON c.ClientGUID = a.ClientGUID AND a.TypeCode = '01'
            LEFT JOIN fraddressdetails ad ON a.AddressGUID = ad.AddressGUID
            WHERE r.RoleCode = '01'
            ORDER BY af.LastModifiedDate DESC
            LIMIT 50
        """;

        return executeQuery(sql);
    }

    private List<Map<String, Object>> executeQuery(String sql, Object... args) {
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> result = new HashMap<>();
                result.put("applicationNumber", rs.getString("applicationNumber"));
                
                String ownerType = rs.getString("ownerType");
                if (ownerType == null) {
                    ownerType = "01"; // Default to individual if not provided
                }
                
                if (ownerType.equals("01")) { // Individual
                    result.put("ownerName", rs.getString("firstName") + " " + rs.getString("lastName"));
                    result.put("dateOfBirth", rs.getDate("dateOfBirth") != null ? 
                        rs.getDate("dateOfBirth").toString() : null);
                } else { // Corporate
                    result.put("companyName", rs.getString("companyName"));
                }
                
                result.put("primaryAddress", rs.getString("primaryAddress"));
                result.put("lastModifiedDate", rs.getTimestamp("lastModifiedDate") != null ? 
                    rs.getTimestamp("lastModifiedDate").toString() : null);
                
                String statusCode = rs.getString("status");
                result.put("status", mapStatusCode(statusCode));
                result.put("ownerType", ownerType);
                
                return result;
            }, args);
        } catch (Exception e) {
            log.error("Error executing search query: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    private String mapStatusCode(String statusCode) {
        return switch (statusCode) {
            case "01" -> "In Progress";
            case "02" -> "Submitted";
            case "03" -> "In Review";
            case "04" -> "Approved";
            case "05" -> "Declined";
            default -> "Unknown";
        };
    }
} 