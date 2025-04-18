package com.backend.api.dto;

import com.backend.api.entity.UserRole;
import lombok.Data;

@Data
public class UserCreateRequest {
    private String name;
    private String email;
    private String password;
    private UserRole role;
} 