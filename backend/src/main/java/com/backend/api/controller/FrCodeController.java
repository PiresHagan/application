package com.backend.api.controller;

import com.backend.api.service.FrCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/dropdowns")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FrCodeController {
    @Autowired
    private FrCodeService frCodeService;

    @GetMapping
    public ResponseEntity<Map<String, List<Map<String, String>>>> getDropdownValues() {
        return ResponseEntity.ok(frCodeService.getAllDropdownValues());
    }
}