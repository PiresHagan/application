package com.backend.api.dto;

import com.backend.api.entity.UserRole;
import lombok.Data;

@Data
public class UserUpdateRequest {
    private String name;
    private String email;
    private String password; // Optional, only updated if not null or empty
    private UserRole role;
} 