package com.taxedge.customer.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<Map<String, Object>> handleConstraint(DataIntegrityViolationException ex) {
	    Map<String, Object> body = new LinkedHashMap<>();
	    body.put("timestamp", LocalDateTime.now());
	    body.put("status", HttpStatus.CONFLICT.value());
	    body.put("error", "This record already exists");
	    return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
	}
	
	@ExceptionHandler(InvalidCredentialsException.class)
	public ResponseEntity<Map<String, Object>> handleInvalidCredentials(InvalidCredentialsException ex) {
	    Map<String, Object> body = new LinkedHashMap<>();
	    body.put("timestamp", LocalDateTime.now());
	    body.put("status", HttpStatus.UNAUTHORIZED.value());
	    body.put("error", ex.getMessage());
	    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
	}
    }

