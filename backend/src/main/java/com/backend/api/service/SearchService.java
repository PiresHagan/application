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

    public List<Map<String, Object>> searchByApplicationNumber(String applicationNumber, int page, int size) {
        log.info("Searching for application with number: {} (page: {}, size: {})", applicationNumber, page, size);

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
                c.TypeCode as ownerType,
                CONCAT(agentC.FirstName, ' ', agentC.LastName) as createdBy
            FROM frapplicationform af
            JOIN frrole r ON af.ApplicationFormGUID = r.ApplicationFormGUID AND r.RoleCode = '01'
            JOIN frclient c ON r.ClientGUID = c.ClientGUID
            LEFT JOIN fraddress a ON c.ClientGUID = a.ClientGUID AND a.TypeCode = '01'
            LEFT JOIN fraddressdetails ad ON a.AddressGUID = ad.AddressGUID
            LEFT JOIN frrole agentR ON af.ApplicationFormGUID = agentR.ApplicationFormGUID AND agentR.RoleCode = '03'
            LEFT JOIN frclient agentC ON agentR.ClientGUID = agentC.ClientGUID
            WHERE af.ApplicationFormNumber LIKE ?
            ORDER BY af.LastModifiedDate DESC
            LIMIT ? OFFSET ?
        """;

        return executeQuery(sql, "%" + applicationNumber + "%", size, page * size);
    }

    public long countByApplicationNumber(String applicationNumber) {
        String sql = """
            SELECT COUNT(*)
            FROM frapplicationform af
            JOIN frrole r ON af.ApplicationFormGUID = r.ApplicationFormGUID AND r.RoleCode = '01'
            WHERE af.ApplicationFormNumber LIKE ?
        """;
        
        return jdbcTemplate.queryForObject(sql, Long.class, "%" + applicationNumber + "%");
    }

    public List<Map<String, Object>> searchByIndividualOwner(String firstName, String lastName, int page, int size) {
        log.info("Searching for applications with individual owner - firstName: {}, lastName: {} (page: {}, size: {})", 
                firstName, lastName, page, size);

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
                '01' as ownerType,
                CONCAT(agentC.FirstName, ' ', agentC.LastName) as createdBy
            FROM frapplicationform af
            JOIN frrole r ON af.ApplicationFormGUID = r.ApplicationFormGUID AND r.RoleCode = '01'
            JOIN frclient c ON r.ClientGUID = c.ClientGUID
            LEFT JOIN fraddress a ON c.ClientGUID = a.ClientGUID AND a.TypeCode = '01'
            LEFT JOIN fraddressdetails ad ON a.AddressGUID = ad.AddressGUID
            LEFT JOIN frrole agentR ON af.ApplicationFormGUID = agentR.ApplicationFormGUID AND agentR.RoleCode = '03'
            LEFT JOIN frclient agentC ON agentR.ClientGUID = agentC.ClientGUID
            WHERE r.RoleCode = '01' 
            AND c.TypeCode = '01'
            AND (c.FirstName LIKE ? OR c.LastName LIKE ?)
            ORDER BY af.LastModifiedDate DESC
            LIMIT ? OFFSET ?
        """;

        return executeQuery(sql, 
            firstName != null && !firstName.isEmpty() ? "%" + firstName + "%" : "%",
            lastName != null && !lastName.isEmpty() ? "%" + lastName + "%" : "%",
            size, page * size
        );
    }

    public long countByIndividualOwner(String firstName, String lastName) {
        String sql = """
            SELECT COUNT(*)
            FROM frapplicationform af
            JOIN frrole r ON af.ApplicationFormGUID = r.ApplicationFormGUID
            JOIN frclient c ON r.ClientGUID = c.ClientGUID
            WHERE r.RoleCode = '01' 
            AND c.TypeCode = '01'
            AND (c.FirstName LIKE ? OR c.LastName LIKE ?)
        """;
        
        return jdbcTemplate.queryForObject(sql, Long.class,
            firstName != null && !firstName.isEmpty() ? "%" + firstName + "%" : "%",
            lastName != null && !lastName.isEmpty() ? "%" + lastName + "%" : "%"
        );
    }

    public List<Map<String, Object>> searchByCorporateOwner(String companyName, int page, int size) {
        log.info("Searching for applications with corporate owner - companyName: {} (page: {}, size: {})", 
                companyName, page, size);

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
                '02' as ownerType,
                CONCAT(agentC.FirstName, ' ', agentC.LastName) as createdBy
            FROM frapplicationform af
            JOIN frrole r ON af.ApplicationFormGUID = r.ApplicationFormGUID AND r.RoleCode = '01'
            JOIN frclient c ON r.ClientGUID = c.ClientGUID
            LEFT JOIN fraddress a ON c.ClientGUID = a.ClientGUID AND a.TypeCode = '01'
            LEFT JOIN fraddressdetails ad ON a.AddressGUID = ad.AddressGUID
            LEFT JOIN frrole agentR ON af.ApplicationFormGUID = agentR.ApplicationFormGUID AND agentR.RoleCode = '03'
            LEFT JOIN frclient agentC ON agentR.ClientGUID = agentC.ClientGUID
            WHERE r.RoleCode = '01' 
            AND c.TypeCode = '02'
            AND c.CompanyName LIKE ?
            ORDER BY af.LastModifiedDate DESC
            LIMIT ? OFFSET ?
        """;

        return executeQuery(sql, "%" + companyName + "%", size, page * size);
    }

    public long countByCorporateOwner(String companyName) {
        String sql = """
            SELECT COUNT(*)
            FROM frapplicationform af
            JOIN frrole r ON af.ApplicationFormGUID = r.ApplicationFormGUID
            JOIN frclient c ON r.ClientGUID = c.ClientGUID
            WHERE r.RoleCode = '01' 
            AND c.TypeCode = '02'
            AND c.CompanyName LIKE ?
        """;
        
        return jdbcTemplate.queryForObject(sql, Long.class, "%" + companyName + "%");
    }

    public List<Map<String, Object>> getAllApplications(int page, int size) {
        log.info("Retrieving all applications (page: {}, size: {})", page, size);

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
                c.TypeCode as ownerType,
                CONCAT(agentC.FirstName, ' ', agentC.LastName) as createdBy
            FROM frapplicationform af
            JOIN frrole r ON af.ApplicationFormGUID = r.ApplicationFormGUID AND r.RoleCode = '01'
            JOIN frclient c ON r.ClientGUID = c.ClientGUID
            LEFT JOIN fraddress a ON c.ClientGUID = a.ClientGUID AND a.TypeCode = '01'
            LEFT JOIN fraddressdetails ad ON a.AddressGUID = ad.AddressGUID
            LEFT JOIN frrole agentR ON af.ApplicationFormGUID = agentR.ApplicationFormGUID AND agentR.RoleCode = '03'
            LEFT JOIN frclient agentC ON agentR.ClientGUID = agentC.ClientGUID
            WHERE r.RoleCode = '01'
            ORDER BY af.LastModifiedDate DESC
            LIMIT ? OFFSET ?
        """;

        return executeQuery(sql, size, page * size);
    }

    public long countAllApplications() {
        String sql = """
            SELECT COUNT(*)
            FROM frapplicationform af
            JOIN frrole r ON af.ApplicationFormGUID = r.ApplicationFormGUID
            WHERE r.RoleCode = '01'
        """;
        
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    private List<Map<String, Object>> executeQuery(String sql, Object... args) {
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> result = new HashMap<>();
                result.put("applicationNumber", rs.getString("applicationNumber"));
                
                String ownerType = rs.getString("ownerType");
                if (ownerType == null) {
                    ownerType = "01"; 
                }
                
                if (ownerType.equals("01")) { // Individual
                    result.put("ownerName", rs.getString("firstName") + " " + rs.getString("lastName"));
                    result.put("dateOfBirth", rs.getDate("dateOfBirth") != null ? 
                        rs.getDate("dateOfBirth").toString() : null);
                } else { 
                    result.put("companyName", rs.getString("companyName"));
                }
                
                result.put("primaryAddress", rs.getString("primaryAddress"));
                
                if (rs.getTimestamp("lastModifiedDate") != null) {
                    java.sql.Date date = new java.sql.Date(rs.getTimestamp("lastModifiedDate").getTime());
                    result.put("lastModifiedDate", date.toString());
                } else {
                    result.put("lastModifiedDate", null);
                }
                
                String statusCode = rs.getString("status");
                result.put("status", mapStatusCode(statusCode));
                result.put("ownerType", ownerType);
                result.put("createdBy", rs.getString("createdBy"));
                
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