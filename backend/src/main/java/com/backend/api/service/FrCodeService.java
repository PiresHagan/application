package com.backend.api.service;

import com.backend.api.repository.FrCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FrCodeService {
    @Autowired
    private FrCodeRepository frCodeRepository;

    public Map<String, List<Map<String, String>>> getAllDropdownValues() {
        Map<String, List<Map<String, String>>> dropdowns = new HashMap<>();
        
        // Fetch from database
        log.info("Fetching countries...");
        List<Map<String, String>> countries = frCodeRepository.findCodeAndDescriptionByCodeName("frcodeCountry");
        log.info("Found {} countries", countries.size());
        dropdowns.put("countries", countries);

        log.info("Fetching states...");
        List<Map<String, String>> states = frCodeRepository.findCodeAndDescriptionByCodeName("frcodeState");
        log.info("Found {} states", states.size());
        dropdowns.put("states", states);

        log.info("Fetching provinces...");
        List<Map<String, String>> provinces = frCodeRepository.findCodeAndDescriptionByCodeName("frcodeProvince");
        log.info("Found {} provinces", provinces.size());
        dropdowns.put("provinces", provinces);
        
        return dropdowns;
    }
} 