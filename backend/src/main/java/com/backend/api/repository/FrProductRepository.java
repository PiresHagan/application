package com.backend.api.repository;

import com.backend.api.entity.FrProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FrProductRepository extends JpaRepository<FrProduct, String> {
    @Query(value = "SELECT p.* FROM frproduct p JOIN frcompany c ON c.CompanyGUID = p.CompanyGUID WHERE c.CompanyName = :companyName", nativeQuery = true)
    List<FrProduct> findByCompanyName(@Param("companyName") String companyName);
} 