# QUICK REFERENCE: Hardcoded Credentials & Security Issues Found

## Location 1: MyAccount.jsx — Hardcoded Demo Passwords

**File**: `src/components/dashboard/MyAccount.jsx`  
**Lines**: 100-110  
**Function**: `handleChangePassword()`  
**Status**: 🔴 CRITICAL SECURITY ISSUE

```javascript
// Line 100-110
const savedPasswords = localStorage.getItem("cms_user_passwords")
const passwordsMap = savedPasswords
  ? JSON.parse(savedPasswords)
  : {
      "superadmin@terratech.com": "superadmin123",   // ❌ HARDCODED
      "admin@terratech.com": "admin123",             // ❌ HARDCODED
      "operator@terratech.com": "operator123",       // ❌ HARDCODED
      "editor@terratech.com": "editor123"            // ❌ HARDCODED
    }
if (!savedPasswords) {
  localStorage.setItem("cms_user_passwords", JSON.stringify(passwordsMap))
}
```

**Issue**: Demo credentials hardcoded in frontend code  
**Risk**: Visible in source, bundle, DevTools  
**CWE**: CWE-798 (Use of Hard-Coded Credentials)  

---

## Location 2: MyAccount.jsx — Fallback Admin Password

**File**: `src/components/dashboard/MyAccount.jsx`  
**Line**: 114  
**Function**: `handleChangePassword()`  
**Status**: 🔴 CRITICAL SECURITY ISSUE

```javascript
// Line 114
const currentActualPassword = passwordsMap[currentEmail] || "admin123" // fallback for demo
```

**Issue**: If user not in passwordsMap, fallback to hardcoded "admin123"  
**Risk**: Any user without entry can log in with admin123  
**CWE**: CWE-798  

---

## Location 3: MyAccount.jsx — Frontend-Only Validation

**File**: `src/components/dashboard/MyAccount.jsx`  
**Line**: 116  
**Function**: `handleChangePassword()`  
**Status**: 🔴 CRITICAL SECURITY ISSUE

```javascript
// Line 116
if (oldPassword !== currentActualPassword) {
  setErrorPassword("Kata sandi lama yang Anda masukkan salah.")
  return
}
```

**Issue**: Password compared only in browser, no backend API call  
**Risk**: Validation can be bypassed via DevTools  
**CWE**: CWE-602 (Client-Side Enforcement of Security Policy)  

---

## Location 4: MyAccount.jsx — Plaintext Storage (First Occurrence)

**File**: `src/components/dashboard/MyAccount.jsx`  
**Lines**: 59-68  
**Function**: `handleUpdateProfile()`  
**Status**: 🔴 CRITICAL SECURITY ISSUE

```javascript
// Lines 59-68
const savedPasswords = localStorage.getItem("cms_user_passwords")
if (savedPasswords) {
  const passwordsMap = JSON.parse(savedPasswords)
  if (passwordsMap[currentEmail]) {
    passwordsMap[email.trim()] = passwordsMap[currentEmail]
    if (currentEmail.toLowerCase() !== email.trim().toLowerCase()) {
      delete passwordsMap[currentEmail]
    }
    localStorage.setItem("cms_user_passwords", JSON.stringify(passwordsMap))
  }
}
```

**Issue**: Syncs password map to localStorage when email changes  
**Risk**: Passwords stored in plaintext  
**CWE**: CWE-256 (Plaintext Storage of Password)  

---

## Location 5: MyAccount.jsx — Plaintext Storage (Second Occurrence)

**File**: `src/components/dashboard/MyAccount.jsx`  
**Line**: 110 (inside handleChangePassword)  
**Function**: `handleChangePassword()`  
**Status**: 🔴 CRITICAL SECURITY ISSUE

```javascript
// Line 110
localStorage.setItem("cms_user_passwords", JSON.stringify(passwordsMap))
```

**Issue**: After getting hardcoded passwordsMap, save it back to localStorage  
**Risk**: Passwords persist in plaintext storage  
**CWE**: CWE-256  

---

## Location 6: MyAccount.jsx — Plaintext Storage (Third Occurrence)

**File**: `src/components/dashboard/MyAccount.jsx`  
**Line**: 123 (inside handleChangePassword)  
**Function**: `handleChangePassword()`  
**Status**: 🔴 CRITICAL SECURITY ISSUE

```javascript
// Line 123
passwordsMap[currentEmail] = newPassword
localStorage.setItem("cms_user_passwords", JSON.stringify(passwordsMap))
```

**Issue**: After password change, new password saved in plaintext localStorage  
**Risk**: New password exposed to XSS, DevTools, etc.  
**CWE**: CWE-256  

---

## Location 7: MyAccount.jsx — Plaintext Storage (Fourth Occurrence)

**File**: `src/components/dashboard/MyAccount.jsx`  
**Lines**: 145-150  
**Function**: `handleDeleteAccount()`  
**Status**: 🔴 CRITICAL SECURITY ISSUE

```javascript
// Lines 145-150
const savedPasswords = localStorage.getItem("cms_user_passwords")
if (savedPasswords) {
  const passwordsMap = JSON.parse(savedPasswords)
  delete passwordsMap[currentEmail]
  localStorage.setItem("cms_user_passwords", JSON.stringify(passwordsMap))
}
```

**Issue**: During account deletion, removes password from localStorage passwordsMap  
**Risk**: Confirms that passwords are stored in plaintext  
**CWE**: CWE-256  

---

## Summary of All Issues

### Total Issues Found: 7

| # | Location | Issue Type | Line(s) | Severity |
|---|----------|-----------|---------|----------|
| 1 | handleChangePassword | Hardcoded demo passwords | 104-107 | 🔴 CRITICAL |
| 2 | handleChangePassword | Fallback hardcoded password | 114 | 🔴 CRITICAL |
| 3 | handleChangePassword | Frontend-only validation | 116 | 🔴 CRITICAL |
| 4 | handleUpdateProfile | Plaintext localStorage storage | 59-68 | 🔴 CRITICAL |
| 5 | handleChangePassword | Plaintext localStorage storage | 110 | 🔴 CRITICAL |
| 6 | handleChangePassword | Plaintext localStorage storage | 123 | 🔴 CRITICAL |
| 7 | handleDeleteAccount | Plaintext localStorage storage | 145-150 | 🔴 CRITICAL |

---

## All Hardcoded Credentials Found

```
"superadmin@terratech.com": "superadmin123"     ❌ EXPOSED
"admin@terratech.com": "admin123"               ❌ EXPOSED  
"operator@terratech.com": "operator123"         ❌ EXPOSED
"editor@terratech.com": "editor123"             ❌ EXPOSED
fallback: "admin123"                            ❌ EXPOSED
```

---

## All localStorage Keys Used for Passwords

```
localStorage.getItem("cms_user_passwords")      ❌ PLAINTEXT STORAGE
localStorage.setItem("cms_user_passwords", ...) ❌ PLAINTEXT STORAGE
```

---

## Backend Endpoints Status

### ✅ EXISTS
```
PUT /api/v1/cms/users/{id}/password
└─ For admin changing OTHER user's password
```

### ❌ MISSING (BLOCKER)
```
POST /api/v1/auth/verify-password
└─ For verifying current user's password
   STATUS: NOT FOUND, NOT DOCUMENTED, NOT IMPLEMENTED

PUT /api/v1/users/me/password
└─ For user to change their own password
   STATUS: NOT FOUND, NOT DOCUMENTED, NOT IMPLEMENTED
```

---

## Grep Search Results

**Found 29 lines with security issues**:

```
src/components/dashboard/MyAccount.jsx:59:    const savedPasswords = 
src/components/dashboard/MyAccount.jsx:61:      const passwordsMap = 
src/components/dashboard/MyAccount.jsx:62:      if (passwordsMap[currentEmail]) {
src/components/dashboard/MyAccount.jsx:63:        passwordsMap[email.trim()] = 
src/components/dashboard/MyAccount.jsx:65:          delete passwordsMap[currentEmail]
src/components/dashboard/MyAccount.jsx:67:        localStorage.setItem("cms_user_passwords", ...)
src/components/dashboard/MyAccount.jsx:100:    const savedPasswords = 
src/components/dashboard/MyAccount.jsx:101:    const passwordsMap = 
src/components/dashboard/MyAccount.jsx:104:          "superadmin@terratech.com": "superadmin123",
src/components/dashboard/MyAccount.jsx:105:          "admin@terratech.com": "admin123",
src/components/dashboard/MyAccount.jsx:106:          "operator@terratech.com": "operator123",
src/components/dashboard/MyAccount.jsx:107:          "editor@terratech.com": "editor123"
src/components/dashboard/MyAccount.jsx:110:      localStorage.setItem("cms_user_passwords", ...)
src/components/dashboard/MyAccount.jsx:114:    const currentActualPassword = passwordsMap[currentEmail] || "admin123"
src/components/dashboard/MyAccount.jsx:116:    if (oldPassword !== currentActualPassword) {
src/components/dashboard/MyAccount.jsx:122:    passwordsMap[currentEmail] = newPassword
src/components/dashboard/MyAccount.jsx:123:    localStorage.setItem("cms_user_passwords", ...)
src/components/dashboard/MyAccount.jsx:145:    const savedPasswords = 
src/components/dashboard/MyAccount.jsx:147:      const passwordsMap = 
src/components/dashboard/MyAccount.jsx:148:      delete passwordsMap[currentEmail]
src/components/dashboard/MyAccount.jsx:149:    localStorage.setItem("cms_user_passwords", ...)
```

---

## CWE Classifications

**CWE-798: Use of Hard-Coded Credentials**
- Hardcoded passwords in code (lines 104-107)
- Hardcoded fallback password (line 114)

**CWE-256: Plaintext Storage of Password**
- Passwords stored without encryption (lines 59-68, 110, 123, 145-150)

**CWE-602: Client-Side Enforcement of Security Policy**
- Frontend-only validation (line 116)
- No backend verification required

---

## What Needs to Be Deleted

### Delete from handleUpdateProfile() — Lines 59-68
```javascript
const savedPasswords = localStorage.getItem("cms_user_passwords")
if (savedPasswords) {
  const passwordsMap = JSON.parse(savedPasswords)
  if (passwordsMap[currentEmail]) {
    passwordsMap[email.trim()] = passwordsMap[currentEmail]
    if (currentEmail.toLowerCase() !== email.trim().toLowerCase()) {
      delete passwordsMap[currentEmail]
    }
    localStorage.setItem("cms_user_passwords", JSON.stringify(passwordsMap))
  }
}
```

### Replace handleChangePassword() — Lines 80-129
Delete entire function and rewrite using API calls (when backend ready)

### Delete from handleDeleteAccount() — Lines 145-150
```javascript
const savedPasswords = localStorage.getItem("cms_user_passwords")
if (savedPasswords) {
  const passwordsMap = JSON.parse(savedPasswords)
  delete passwordsMap[currentEmail]
  localStorage.setItem("cms_user_passwords", JSON.stringify(passwordsMap))
}
```

---

## Current Fix Status

🔴 **BLOCKED** — Cannot proceed without backend endpoints

**Reason**: No API endpoints exist for:
- Verifying current password
- Changing current user's password

**When backend provides these endpoints**:
- Use `WALKTHROUGH_PASSWORD_SECURITY_FIX.md`
- Implement Phase 2-5
- Deploy and test

**Estimated time after backend ready**: 4-6 hours

---

**End of Quick Reference**

For full details, see: `AUDIT_PASSWORD_SECURITY_DETAILED.md`
