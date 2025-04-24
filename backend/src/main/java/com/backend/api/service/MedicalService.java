package com.backend.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
@Slf4j
public class MedicalService {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final int MAX_FIELD_NAME_LENGTH = 200; // Adjust based on your database column size

    @Transactional
    public void saveMedicalData(String roleGUID, Map<String, Object> medicalData) {
        log.info("Saving medical data for role: {}", roleGUID);
        
        jdbcTemplate.update("DELETE FROM frroledetails WHERE RoleGUID = ?", roleGUID);
        
        for (Map.Entry<String, Object> entry : medicalData.entrySet()) {
            String fieldName = entry.getKey();
            Object value = entry.getValue();
            
            if (value == null) continue;
            
            if (fieldName.length() > MAX_FIELD_NAME_LENGTH) {
                fieldName = fieldName.substring(0, MAX_FIELD_NAME_LENGTH);
            }
            
            if (value instanceof String) {
                String stringValue = (String) value;
                if (stringValue.equals("Y")) {
                    insertRoleDetail(roleGUID, fieldName, null, null, "01", null);
                } else if (stringValue.equals("N")) {
                    insertRoleDetail(roleGUID, fieldName, null, null, "02", null);
                } else {
                    insertRoleDetail(roleGUID, fieldName, null, null, stringValue, null);
                }
            } else if (value instanceof Boolean) {
                Boolean boolValue = (Boolean) value;
                insertRoleDetail(roleGUID, fieldName, null, null, boolValue ? "01" : "02", null);
            } else if (value instanceof Number) {
                if (value instanceof Integer || value instanceof Long) {
                    insertRoleDetail(roleGUID, fieldName, null, ((Number) value).intValue(), null, null);
                } else {
                    insertRoleDetail(roleGUID, fieldName, ((Number) value).doubleValue(), null, null, null);
                }
            } else if (value instanceof LocalDate) {
                insertRoleDetail(roleGUID, fieldName, null, null, null, (LocalDate) value);
            }
        }
        
        log.info("Successfully saved medical data for role: {}", roleGUID);
    }
    
    private void insertRoleDetail(String roleGUID, String fieldName, Double decimalValue, 
                                 Integer integerValue, String textValue, LocalDate dateValue) {
        jdbcTemplate.update(
            "INSERT INTO frroledetails (RoleGUID, FieldName, DecimalValue, IntegerValue, TextValue, DateValue) " +
            "VALUES (?, ?, ?, ?, ?, ?)",
            roleGUID, fieldName, decimalValue, integerValue, textValue, dateValue
        );
    }
} 