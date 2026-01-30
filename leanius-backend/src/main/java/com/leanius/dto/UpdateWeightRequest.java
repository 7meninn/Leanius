package com.leanius.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating song frequency weight.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWeightRequest {

    @NotNull(message = "Weight is required")
    @Min(value = 1, message = "Weight must be at least 1")
    @Max(value = 5, message = "Weight must be at most 5")
    private Integer weight;
}
