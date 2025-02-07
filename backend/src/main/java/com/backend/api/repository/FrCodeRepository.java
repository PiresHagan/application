package com.backend.api.repository;

import com.backend.api.entity.FrCode;
import com.backend.api.entity.FrCodeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;

@Repository
public interface FrCodeRepository extends JpaRepository<FrCode, FrCodeId> {
    @Query(value = "SELECT CodeValue as code, DescriptionLong as description FROM frcode WHERE CodeName = :codeName", nativeQuery = true)
    List<Map<String, String>> findCodeAndDescriptionByCodeName(@Param("codeName") String codeName);
} 