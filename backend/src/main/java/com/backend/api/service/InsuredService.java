package com.backend.api.service;

import com.backend.api.dto.InsuredSaveRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.UUID;

@Service
@Transactional
@Slf4j
public class InsuredService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public String saveInsured(InsuredSaveRequest request) {
        String clientGUID = UUID.randomUUID().toString();
        String roleGUID = UUID.randomUUID().toString();
        log.info("Saving insured: {}", request);

        // Get current ApplicationFormGUID
        String applicationFormGUID = jdbcTemplate.queryForObject("""
            SELECT ApplicationFormGUID 
            FROM frapplicationform 
            WHERE ApplicationFormNumber = ?
            """, 
            String.class, 
            request.getApplicationFormNumber()
        );

        // Insert into frclient
        jdbcTemplate.update("""
            INSERT INTO frclient (
                ClientGUID, TypeCode, FirstName, LastName,
                DateOfBirth, Gender, Tobacco, CountryCode, StateCode,
                SSN
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            clientGUID, "01", request.getFirstName(),
            request.getLastName(), request.getDateOfBirth(),
            request.getGender(), request.getTobacco(), request.getCountryCode(),
            request.getStateCode(), request.getSsn()
        );
        
        jdbcTemplate.update("""
            INSERT INTO frrole (
                RoleGUID, RoleCode, ClientGUID, ApplicationFormGUID, StatusCode
            ) VALUES (?, ?, ?, ?, ?)
            """,
            roleGUID, "02", clientGUID, applicationFormGUID, "01"
        );

        return clientGUID;
    }

    public void updateInsured(String clientGUID, InsuredSaveRequest request) {
        log.info("Updating insured: {} with data: {}", clientGUID, request);

        // Update frclient
        jdbcTemplate.update("""
            UPDATE frclient SET
                FirstName = ?,
                LastName = ?,
                DateOfBirth = ?,
                Gender = ?,
                Tobacco = ?,
                CountryCode = ?,
                StateCode = ?,
                SSN = ?
            WHERE ClientGUID = ?
            """,
            request.getFirstName(),
            request.getLastName(),
            request.getDateOfBirth(),
            request.getGender(),
            request.getTobacco(),
            request.getCountryCode(),
            request.getStateCode(),
            request.getSsn(),
            clientGUID
        );
    }
} 