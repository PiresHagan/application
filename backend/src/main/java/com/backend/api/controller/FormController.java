package com.backend.api.controller;

import com.backend.api.dto.OwnerListResponse;
import com.backend.api.service.FormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/form")
@RequiredArgsConstructor
public class FormController {
    
    private final FormService formService;

    @GetMapping("/{formNumber}/owners")
    public ResponseEntity<List<OwnerListResponse>> getFormOwners(@PathVariable String formNumber) {
        return ResponseEntity.ok(formService.getFormOwners(formNumber));
    }
} 