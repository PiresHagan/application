package com.backend.api.service;

import com.backend.api.dto.OwnerListResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class FormService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<OwnerListResponse> getFormOwners(String formNumber) {
        String sql = """
            SELECT 
                c.ClientGUID,
                r.RoleGUID,
                r.RoleCode,
                CONCAT(c.FirstName, ' ', c.LastName, ' - ', 
                    CASE c.Gender 
                        WHEN 'male' THEN 'Male'
                        ELSE 'Female'
                    END,
                    ' - ',
                    CASE c.Tobacco 
                        WHEN true THEN 'Smoker'
                        ELSE 'Non-Smoker'
                    END,
                    ' - Born: ', c.DateOfBirth) as ownerName,
                c.FirstName,
                c.LastName,
                c.DateOfBirth,
                c.Gender,
                c.Tobacco,
                c.CountryCode,
                c.StateCode,
                c.SSN
            FROM frrole r
            JOIN frclient c ON c.ClientGUID = r.ClientGUID
            JOIN frapplicationform f ON f.ApplicationFormGUID = r.ApplicationFormGUID
            WHERE f.ApplicationFormNumber = ?
            AND c.TypeCode = '01'
            AND r.RoleCode = '01'
            AND r.StatusCode = '01'
            """;

        return jdbcTemplate.query(sql, 
            (rs, rowNum) -> {
                OwnerListResponse owner = new OwnerListResponse();
                owner.setClientGUID(rs.getString("ClientGUID"));
                owner.setRoleGUID(rs.getString("RoleGUID"));
                owner.setRoleCode(rs.getString("RoleCode"));
                owner.setOwnerName(rs.getString("ownerName"));
                owner.setFirstName(rs.getString("FirstName"));
                owner.setLastName(rs.getString("LastName"));
                owner.setDateOfBirth(rs.getString("DateOfBirth"));
                owner.setGender(rs.getString("Gender"));
                owner.setTobacco(rs.getString("Tobacco"));
                owner.setCountryCode(rs.getString("CountryCode"));
                owner.setStateCode(rs.getString("StateCode"));
                owner.setSsn(rs.getString("SSN"));
                return owner;
            },
            formNumber
        );
    }
} 