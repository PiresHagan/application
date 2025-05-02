package com.backend.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.backend.api.service.PaymentService;
import com.backend.api.model.request.PaymentDataRequest;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/premium/{applicationNumber}")
    public ResponseEntity<Map<String, Object>> getApplicationPremium(@PathVariable String applicationNumber) {
        Map<String, Object> premiumData = paymentService.getApplicationPremium(applicationNumber);
        return ResponseEntity.ok(premiumData);
    }

    @PostMapping("/payment/{applicationNumber}")
    public ResponseEntity<Map<String, Object>> savePaymentData(
            @PathVariable String applicationNumber,
            @RequestBody PaymentDataRequest paymentData) {
        Map<String, Object> result = paymentService.savePaymentData(applicationNumber, paymentData);
        return ResponseEntity.ok(result);
    }
} 