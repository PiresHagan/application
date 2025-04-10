package com.backend.api.service;

import com.backend.api.dto.OwnerSaveRequest;
import com.backend.api.dto.OwnerSaveRequest.OwnerDTO;
import com.backend.api.dto.OwnerSaveRequest.AddressDTO;
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
public class OwnerService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void saveOwners(OwnerSaveRequest request) {
        String applicationFormNumber = request.getApplicationFormNumber();
        
        for (OwnerDTO owner : request.getOwners()) {
            String clientGUID = UUID.randomUUID().toString();
            String roleGUID = UUID.randomUUID().toString();
            String applicationFormGUID = UUID.randomUUID().toString();
            String planGUID = (owner.getPlanGUID() != null && !owner.getPlanGUID().isEmpty()) 
                ? owner.getPlanGUID() : UUID.randomUUID().toString();
            
            log.info("Saving owner: {}", owner);

            jdbcTemplate.update("""
                INSERT INTO frapplicationform (
                    ApplicationFormGUID, ApplicationFormNumber, LastModifiedDate, PlanGUID
                ) VALUES (?, ?, ?, ?)
                """,
                applicationFormGUID, applicationFormNumber, LocalDate.now(), planGUID
            );
            
            jdbcTemplate.update("""
                INSERT INTO frclient (
                    ClientGUID, TypeCode, FirstName, LastName, CompanyName,
                    DateOfBirth, Gender, Tobacco, CountryCode, StateCode,
                    SSN, BusinessRegistrationNumber
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                clientGUID, owner.getTypeCode(), owner.getFirstName(),
                owner.getLastName(), owner.getCompanyName(), owner.getDateOfBirth(),
                owner.getGender(), owner.getTobacco(), owner.getCountryCode(),
                owner.getStateCode(), owner.getSsn(), owner.getBusinessRegistrationNumber()
            );
            
            jdbcTemplate.update("""
                INSERT INTO frrole (
                    RoleGUID, RoleCode, ClientGUID, ApplicationFormGUID, StatusCode
                ) VALUES (?, ?, ?, ?, ?)
                """,
                roleGUID, "01", clientGUID, applicationFormGUID, "01"
            );
            
            for (AddressDTO address : owner.getAddresses()) {
                String addressGUID = UUID.randomUUID().toString();
                
                jdbcTemplate.update("""
                    INSERT INTO fraddress (
                        AddressGUID, TypeCode, StatusCode, ClientGUID
                    ) VALUES (?, ?, ?, ?)
                    """,
                    addressGUID, address.getTypeCode(), "01", clientGUID
                );
                
                jdbcTemplate.update("""
                    INSERT INTO fraddressdetails (
                        AddressGUID, AddressLine1, AddressLine2, City,
                        StateCode, CountryCode, ZipCode
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    addressGUID, address.getAddressLine1(), address.getAddressLine2(),
                    address.getCity(), address.getStateCode(), address.getCountryCode(),
                    address.getZipCode()
                );
            }
        }
    }
} 