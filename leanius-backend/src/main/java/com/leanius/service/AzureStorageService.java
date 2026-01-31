package com.leanius.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import com.leanius.exception.InvalidFileException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Service for Azure Blob Storage operations.
 */
@Slf4j
@Service
public class AzureStorageService {

    @Value("${azure.storage.connection-string}")
    private String connectionString;

    @Value("${azure.storage.container-name}")
    private String containerName;

    private BlobContainerClient containerClient;
    private BlobServiceClient blobServiceClient;

    @PostConstruct
    public void init() {
        if (connectionString != null && !connectionString.isEmpty() && 
            !connectionString.equals("UseDevelopmentStorage=true")) {
            try {
                blobServiceClient = new BlobServiceClientBuilder()
                        .connectionString(connectionString)
                        .buildClient();
                containerClient = blobServiceClient.getBlobContainerClient(containerName);
                
                // Create container if it doesn't exist
                if (!containerClient.exists()) {
                    containerClient.create();
                    log.info("Created Azure blob container: {}", containerName);
                }
                log.info("Azure Storage initialized with container: {}", containerName);
            } catch (Exception e) {
                log.warn("Azure Storage not configured or unavailable: {}", e.getMessage());
            }
        } else {
            log.warn("Azure Storage connection string not configured. File uploads will fail.");
        }
    }

    /**
     * Upload a file to Azure Blob Storage and return a SAS URL.
     */
    public String uploadFile(MultipartFile file, String userId) {
        if (containerClient == null) {
            throw new InvalidFileException("Storage service is not available");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String blobName = String.format("%s/%s_%s.%s",
                    userId,
                    System.currentTimeMillis(),
                    UUID.randomUUID().toString().substring(0, 8),
                    extension);

            BlobClient blobClient = containerClient.getBlobClient(blobName);
            blobClient.upload(file.getInputStream(), file.getSize(), true);

            // Generate SAS URL for the uploaded blob
            String sasUrl = generateSasUrl(blobClient);
            log.info("File uploaded to Azure with SAS URL: {}", blobName);
            return sasUrl;
        } catch (IOException e) {
            log.error("Failed to upload file to Azure", e);
            throw new InvalidFileException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Generate a SAS URL for a blob with read permission valid for 1 year.
     */
    public String generateSasUrl(BlobClient blobClient) {
        // SAS token valid for 1 year
        OffsetDateTime expiryTime = OffsetDateTime.now().plusYears(1);
        
        BlobSasPermission permission = new BlobSasPermission().setReadPermission(true);
        
        BlobServiceSasSignatureValues sasValues = new BlobServiceSasSignatureValues(expiryTime, permission);
        
        String sasToken = blobClient.generateSas(sasValues);
        return blobClient.getBlobUrl() + "?" + sasToken;
    }

    /**
     * Generate a SAS URL from an existing blob URL.
     */
    public String generateSasUrlFromBlobUrl(String blobUrl) {
        if (containerClient == null || blobUrl == null) {
            return blobUrl;
        }

        try {
            String blobName = extractBlobNameFromUrl(blobUrl);
            if (blobName != null) {
                BlobClient blobClient = containerClient.getBlobClient(blobName);
                if (blobClient.exists()) {
                    return generateSasUrl(blobClient);
                }
            }
        } catch (Exception e) {
            log.error("Failed to generate SAS URL for: {}", blobUrl, e);
        }
        return blobUrl;
    }

    /**
     * Delete a file from Azure Blob Storage.
     */
    public void deleteFile(String blobUrl) {
        if (containerClient == null || blobUrl == null) {
            return;
        }

        try {
            // Extract blob name from URL (remove any query params like SAS token)
            String cleanUrl = blobUrl.split("\\?")[0];
            String blobName = extractBlobNameFromUrl(cleanUrl);
            if (blobName != null) {
                BlobClient blobClient = containerClient.getBlobClient(blobName);
                if (blobClient.exists()) {
                    blobClient.delete();
                    log.info("File deleted from Azure: {}", blobName);
                }
            }
        } catch (Exception e) {
            log.error("Failed to delete file from Azure: {}", blobUrl, e);
        }
    }

    /**
     * Extract blob name from Azure URL.
     */
    private String extractBlobNameFromUrl(String blobUrl) {
        // URL format: https://{account}.blob.core.windows.net/{container}/{blobName}
        try {
            String containerPath = "/" + containerName + "/";
            int index = blobUrl.indexOf(containerPath);
            if (index >= 0) {
                return blobUrl.substring(index + containerPath.length());
            }
        } catch (Exception e) {
            log.error("Failed to extract blob name from URL: {}", blobUrl);
        }
        return null;
    }

    /**
     * Get file extension from filename.
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }
}
