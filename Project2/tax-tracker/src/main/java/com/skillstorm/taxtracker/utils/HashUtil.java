package com.skillstorm.taxtracker.utils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class HashUtil {

	// Hash for social security numbers where the same input will equal the same output
    public static String hashSSN(String ssn) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(ssn.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedHash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString(); 
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing SSN", e);
        }
    }
	
}
