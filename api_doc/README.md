# BaZi API - Postman Collections & API Documentation Hub

Welcome to the central API documentation repository for the **BaZi API SaaS Platform**. This directory contains complete endpoint guides, request schemas, sample JSON responses, and code snippets for every module in the platform.

---

## 📚 Documentation Index (Module-Wise)

| # | Module | Documentation File | Description | Auth Required |
| :-: | :--- | :--- | :--- | :-: |
| 1 | **Authentication** | [1. auth_api_postman_collection.md](./1.%20auth_api_postman_collection.md) | User Registration, Email OTP verification, Login, Token Refresh, Password Reset & Logout. | Public / JWT |
| 2 | **User & Admin** | [2. user_api_postman_collection.md](./2.%20user_api_postman_collection.md) | Profile management, Admin user management, Block/Unblock users, Bulk soft-delete. | Bearer JWT |
| 3 | **Subscription & Billing** | [3. subscription_api_postman_collection.md](./3.%20subscription_api_postman_collection.md) | Lemon Squeezy Checkout URL generation, Plan upgrade/downgrade, Customer portal, Inbound Webhooks. | Bearer JWT |
| 4 | **API Key Management** | [4. apikey_api_postman_collection.md](./4.%20apikey_api_postman_collection.md) | Generate, list, and revoke API keys with plan tier limit enforcement. | Bearer JWT |
| 5 | **BaZi Calculation Engine** | [5. bazi_calculation_api_doc.md](./5.%20bazi_calculation_api_doc.md) | Core Four Pillars calculation engine, Stems, Branches, Elements, Ten Gods, Stars, Luck Pillars. | `x-api-key` |
| 6 | **Custom Outbound Webhooks** | [6. custom_webhook_api_doc.md](./6.%20custom_webhook_api_doc.md) | Outbound webhooks for PRO/PREMIUM: Register endpoints, HMAC-SHA256 signature verification, Solar Term & Daily events. | Bearer JWT |
| 7 | **System Settings (Admin)** | [7. system_setting_api_doc.md](./7.%20system_setting_api_doc.md) | Dynamic system configuration management (Rate limit penalty, Free retention days, Key expiry days). | Admin JWT |

---

## 🚀 Quick Start Guide

### 1. Base URL
```
https://api.bazi-api.com/api/v1
```
*(For local development: `http://localhost:3031/api/v1`)*

### 2. Common Headers
* **For User Dashboard & Management:**
  ```http
  Authorization: Bearer <your_jwt_token>
  Content-Type: application/json
  ```
* **For BaZi Calculation Engine:**
  ```http
  x-api-key: bazi_your_api_key_here
  Content-Type: application/json
  ```

---

## ⚡ Rate Limits & Plans

| Tier | Rate Limit | Active API Keys | Custom Webhooks | Monthly Price |
| :--- | :---: | :---: | :---: | :---: |
| **FREE** | 30 req/min | 1 Key | ❌ | $0 (Free Forever) |
| **BASIC** | 300 req/min | 3 Keys | ❌ | $19/mo |
| **PRO** | 500 req/min | 10 Keys | ✅ Up to 3 | $49/mo |
| **PREMIUM** | 1,000 req/min | Unlimited | ✅ Up to 10 | $149/mo |
