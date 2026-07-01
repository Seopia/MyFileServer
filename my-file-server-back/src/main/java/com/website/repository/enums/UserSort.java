package com.website.repository.enums;

import java.util.Arrays;

public enum UserSort {

    LAST_LOGIN_TIME("lastLoginTime"),
    ENABLE("enable"),
    ROLE("userRole");
    private final String field;

    UserSort(String field) {
        this.field = field;
    }

    public String getField() {
        return field;
    }
    public static UserSort from(String fieldName) {
        return Arrays.stream(values())
                .filter(f -> f.field.equalsIgnoreCase(fieldName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid sort field: " + fieldName));
    }
}
