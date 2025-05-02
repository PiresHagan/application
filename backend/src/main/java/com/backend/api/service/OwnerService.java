package com.backend.api.service;

import com.backend.api.dto.OwnerSaveRequest;
import com.backend.api.dto.OwnerSaveRequest.OwnerDTO;
import com.backend.api.dto.OwnerSaveRequest.AddressDTO;
import com.backend.api.entity.User;
import com.backend.api.repository.UserRepository;
import com.backend.api.security.SecurityUtils;
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
    
    @Autowired
    private UserRepository userRepository;

    public void saveOwners(OwnerSaveRequest request) {
        String applicationFormNumber = request.getApplicationFormNumber();
        
        String currentUsername = SecurityUtils.getCurrentUsername();
        log.info("Current logged-in user: {}", currentUsername);
        
        for (OwnerDTO owner : request.getOwners()) {
            String clientGUID = UUID.randomUUID().toString();
            String roleGUID = UUID.randomUUID().toString();
            String applicationFormGUID = getApplicationFormGUID(applicationFormNumber);
            boolean isUpdate = applicationFormGUID != null;
            
            if (applicationFormGUID == null) {
                applicationFormGUID = UUID.randomUUID().toString();
            }
            
            String planGUID = (owner.getPlanGUID() != null && !owner.getPlanGUID().isEmpty()) 
                ? owner.getPlanGUID() : UUID.randomUUID().toString();
            
            log.info("Saving owner: {}", owner);

            if (isUpdate) {
                log.info("Updating existing application form: {}", applicationFormGUID);
                jdbcTemplate.update("""
                    UPDATE frapplicationform SET LastModifiedDate = ?, PlanGUID = ?
                    WHERE ApplicationFormGUID = ?
                    """,
                    LocalDate.now(), planGUID, applicationFormGUID
                );
            } else {
                jdbcTemplate.update("""
                    INSERT INTO frapplicationform (
                        ApplicationFormGUID, ApplicationFormNumber, LastModifiedDate, PlanGUID
                    ) VALUES (?, ?, ?, ?)
                    """,
                    applicationFormGUID, applicationFormNumber, LocalDate.now(), planGUID
                );
            }
            
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
                roleGUID, owner.getRoleCode() != null ? owner.getRoleCode() : "01", clientGUID, applicationFormGUID, "01"
            );
            
            if (currentUsername != null) {
                User currentUser = userRepository.findByEmail(currentUsername).orElse(null);
                if (currentUser != null) {
                    log.info("Saving agent role for user: {}", currentUser.getName());
                    
                    String agentClientGUID = getOrCreateClientForUser(currentUser);
                    
                    String agentRoleGUID = UUID.randomUUID().toString();
                    jdbcTemplate.update("""
                        INSERT INTO frrole (
                            RoleGUID, RoleCode, ClientGUID, ApplicationFormGUID, StatusCode
                        ) VALUES (?, ?, ?, ?, ?)
                        """,
                        agentRoleGUID, "03", agentClientGUID, applicationFormGUID, "01"
                    );
                    log.info("Agent role saved with GUID: {}", agentRoleGUID);
                }
            }
            
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
    
    /**
     * Get application form GUID for an application number if it exists
     * @param applicationNumber The application form number
     * @return The application form GUID or null if not found
     */
    private String getApplicationFormGUID(String applicationNumber) {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT ApplicationFormGUID FROM frapplicationform WHERE ApplicationFormNumber = ?",
                String.class,
                applicationNumber
            );
        } catch (Exception e) {
            log.debug("Application form not found for number: {}", applicationNumber);
            return null;
        }
    }
    
    /**
     * Get client GUID for a user, or create a new client record if needed
     * @param user The user to get or create a client for
     * @return The client GUID
     */
    private String getOrCreateClientForUser(User user) {
        // Check if client record exists for this user
        String clientGUID = jdbcTemplate.query(
            "SELECT ClientGUID FROM frclient WHERE TypeCode = '03' AND FirstName = ? AND LastName = ?",
            (rs, rowNum) -> rs.getString("ClientGUID"),
            user.getName().split(" ")[0], // Assuming name format is "FirstName LastName"
            user.getName().contains(" ") ? user.getName().substring(user.getName().indexOf(" ") + 1) : ""
        ).stream().findFirst().orElse(null);
        
        // Create client record if not exists
        if (clientGUID == null) {
            clientGUID = UUID.randomUUID().toString();
            String firstName = user.getName().split(" ")[0];
            String lastName = user.getName().contains(" ") 
                ? user.getName().substring(user.getName().indexOf(" ") + 1) 
                : "";
                
            jdbcTemplate.update("""
                INSERT INTO frclient (
                    ClientGUID, TypeCode, FirstName, LastName
                ) VALUES (?, ?, ?, ?)
                """,
                clientGUID, "03", firstName, lastName
            );
            log.info("Created new client record for agent with GUID: {}", clientGUID);
        }
        
        return clientGUID;
    }
} 