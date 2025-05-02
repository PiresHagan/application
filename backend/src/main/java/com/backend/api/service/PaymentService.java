package com.backend.api.service;

import java.util.HashMap;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.api.model.request.PaymentDataRequest;

import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
public class PaymentService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Retrieves premium data for an application from the database
     * 
     * @param applicationNumber The application number
     * @return Map containing premium amounts for different payment modes
     */
    public Map<String, Object> getApplicationPremium(String applicationNumber) {
        log.info("Retrieving premium data for application: {}", applicationNumber);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            String applicationFormGUID = getApplicationFormGUID(applicationNumber);
            if (applicationFormGUID == null) {
                throw new RuntimeException("Application form not found for number: " + applicationNumber);
            }
            
            Double monthlyPremium = getPremiumAmount(applicationFormGUID, "MonthlyPremium");
            Double quarterlyPremium = getPremiumAmount(applicationFormGUID, "QuarterlyPremium");
            Double semiAnnualPremium = getPremiumAmount(applicationFormGUID, "SemiAnnualPremium");
            Double annualPremium = getPremiumAmount(applicationFormGUID, "AnnualPremium");
            
            if (annualPremium != null) {
                if (monthlyPremium == null) {
                    monthlyPremium = annualPremium / 12.0;
                }
                if (quarterlyPremium == null) {
                    quarterlyPremium = annualPremium / 4.0;
                }
                if (semiAnnualPremium == null) {
                    semiAnnualPremium = annualPremium / 2.0;
                }
            } else if (monthlyPremium != null) {
                annualPremium = monthlyPremium * 12.0;
                quarterlyPremium = monthlyPremium * 3.0;
                semiAnnualPremium = monthlyPremium * 6.0;
            }
            
            result.put("monthlyPremium", monthlyPremium);
            result.put("quarterlyPremium", quarterlyPremium);
            result.put("semiAnnualPremium", semiAnnualPremium);
            result.put("annualPremium", annualPremium);
            
            log.info("Retrieved premium data for application {}: {}", applicationNumber, result);
            
        } catch (Exception e) {
            log.error("Error retrieving premium data: {}", e.getMessage(), e);
            result.put("monthlyPremium", 0.0);
            result.put("quarterlyPremium", 0.0);
            result.put("semiAnnualPremium", 0.0);
            result.put("annualPremium", 0.0);
        }
        
        return result;
    }
    
    /**
     * Saves payment data for an application
     * 
     * @param applicationNumber The application number
     * @param paymentData The payment data to save
     * @return Map containing status of the operation
     */
    public Map<String, Object> savePaymentData(String applicationNumber, PaymentDataRequest paymentData) {
        log.info("Saving payment data for application: {}", applicationNumber);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            String applicationFormGUID = getApplicationFormGUID(applicationNumber);
            if (applicationFormGUID == null) {
                throw new RuntimeException("Application form not found for number: " + applicationNumber);
            }
            
            String paymentMode = paymentData.getPaymentMode();
            if (paymentMode != null) {
                saveApplicationFormDetail(applicationFormGUID, "PaymentMode", null, null, mapPaymentModeToCode(paymentMode), null);
            }
            
            String paymentMethod = paymentData.getPaymentMethod();
            if (paymentMethod != null) {
                saveApplicationFormDetail(applicationFormGUID, "PaymentMethod", null, null, mapPaymentMethodToCode(paymentMethod), null);
            }
            
            String initialPayment = paymentData.getInitialPaymentOption();
            if (initialPayment != null) {
                saveApplicationFormDetail(applicationFormGUID, "InitialPaymentOption", null, null, initialPayment, null);
            }
            
            Boolean authorizePayments = paymentData.getAuthorizePayments();
            if (authorizePayments != null) {
                saveApplicationFormDetail(applicationFormGUID, "AuthorizePayments", null, authorizePayments ? 1 : 0, null, null);
            }
            
            // TODO: Save payors and payment method specific details in separate tables
            
            result.put("success", true);
            result.put("message", "Payment data saved successfully");
            
        } catch (Exception e) {
            log.error("Error saving payment data: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Error saving payment data: " + e.getMessage());
        }
        
        return result;
    }
    
    private String getApplicationFormGUID(String applicationNumber) {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT ApplicationFormGUID FROM frapplicationform WHERE ApplicationFormNumber = ?",
                String.class,
                applicationNumber
            );
        } catch (Exception e) {
            log.error("Error getting application form GUID: {}", e.getMessage());
            return null;
        }
    }
    
    private Double getPremiumAmount(String applicationFormGUID, String fieldName) {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT DecimalValue FROM frapplicationformdetails WHERE ApplicationFormGUID = ? AND FieldName = ?",
                Double.class,
                applicationFormGUID, fieldName
            );
        } catch (Exception e) {
            log.debug("No premium data found for field {}: {}", fieldName, e.getMessage());
            return null;
        }
    }
    
    private void saveApplicationFormDetail(String applicationFormGUID, String fieldName, 
                                         Double decimalValue, Integer integerValue, 
                                         String textValue, LocalDate dateValue) {
        // First delete any existing value
        jdbcTemplate.update(
            "DELETE FROM frapplicationformdetails WHERE ApplicationFormGUID = ? AND FieldName = ?",
            applicationFormGUID, fieldName
        );
        
        // Then insert the new value
        jdbcTemplate.update(
            "INSERT INTO frapplicationformdetails (ApplicationFormGUID, FieldName, DecimalValue, IntegerValue, TextValue, DateValue) " +
            "VALUES (?, ?, ?, ?, ?, ?)",
            applicationFormGUID, fieldName, decimalValue, integerValue, textValue, dateValue
        );
    }
    
    private String mapPaymentModeToCode(String paymentMode) {
        switch (paymentMode) {
            case "monthly":
                return "01";
            case "quarterly":
                return "02";
            case "semi_annually":
                return "03";
            case "annually":
                return "04";
            default:
                return "01";
        }
    }
    
    private String mapPaymentMethodToCode(String paymentMethod) {
        switch (paymentMethod) {
            case "ach":
                return "01";
            case "card":
                return "02";
            case "direct_billing":
                return "03";
            case "payroll":
                return "04";
            case "online_banking":
                return "05";
            default:
                return "01";
        }
    }
} 