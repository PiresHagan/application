package com.backend.api.controller;

import com.backend.api.dto.InsuredSaveRequest;
import com.backend.api.service.InsuredService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/insured")
@RequiredArgsConstructor
public class InsuredController {
    
    private final InsuredService insuredService;

    @PostMapping
    public ResponseEntity<Map<String, String>> saveInsured(@RequestBody InsuredSaveRequest request) {
        String clientGUID = insuredService.saveInsured(request);
        return ResponseEntity.ok(Map.of("clientGUID", clientGUID));
    }

    @PutMapping("/{clientGUID}")
    public ResponseEntity<Void> updateInsured(
        @PathVariable String clientGUID,
        @RequestBody InsuredSaveRequest request
    ) {
        insuredService.updateInsured(clientGUID, request);
        return ResponseEntity.ok().build();
    }
} 