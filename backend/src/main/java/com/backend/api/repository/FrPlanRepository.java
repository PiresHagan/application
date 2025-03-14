package com.backend.api.repository;

import com.backend.api.entity.FrPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FrPlanRepository extends JpaRepository<FrPlan, String> {
    @Query(value = "SELECT * FROM frplan WHERE ProductGUID = :productGUID", nativeQuery = true)
    List<FrPlan> findByProductGUID(@Param("productGUID") String productGUID);
} 