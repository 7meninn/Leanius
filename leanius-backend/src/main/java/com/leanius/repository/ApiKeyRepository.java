package com.leanius.repository;

import com.leanius.model.ApiKey;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for ApiKey entity operations.
 */
@Repository
public interface ApiKeyRepository extends MongoRepository<ApiKey, String> {

    Optional<ApiKey> findByKey(String key);

    Optional<ApiKey> findByUserId(String userId);

    boolean existsByKey(String key);

    boolean existsByUserId(String userId);

    void deleteByUserId(String userId);
}
