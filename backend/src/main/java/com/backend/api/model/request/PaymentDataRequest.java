package com.backend.api.model.request;

import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class PaymentDataRequest {
    private String paymentMode;
    private String paymentMethod;
    private String initialPaymentOption;
    private Boolean authorizePayments;
    
    // ACH-specific fields
    private String bankAccountType;
    private Map<String, Object> bankAccountInfo;
    private Boolean hasCheckSpecimen;
    private Boolean authorizeAutoWithdrawal;
    
    // Card-specific fields
    private Map<String, Object> cardInfo;
    
    // Payor information
    private List<PayorInfo> payors;
    
    @Data
    public static class PayorInfo {
        private Integer id;
        private String payorId;
        private Double allocation;
    }
} 