package com.demony.invest.data.api

/**
 * Custom exception that carries the HTTP status code from API errors.
 * Used so ViewModels can distinguish 401/403 (auth errors) from other failures.
 */
class ApiException(
    val statusCode: Int,
    message: String
) : Exception(message)
