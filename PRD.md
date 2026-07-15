# PRD.md - Backend E-Commerce Elektronik

> Version: 1.0

## 1. Project Overview

Backend REST API untuk website e-commerce alat elektronik.

### Tech Stack

-   NestJS
-   TypeScript
-   TypeORM
-   MySQL (XAMPP/phpMyAdmin)
-   JWT
-   Passport
-   bcrypt
-   Swagger
-   class-validator

## 2. Goals

-   API yang konsisten untuk frontend Next.js.
-   Struktur scalable.
-   Clean Architecture.
-   Mudah diintegrasikan.

## 3. Development Rules (WAJIB)

1.  Jangan mengubah file yang tidak berhubungan.
2.  Jangan mengubah endpoint yang sudah ada.
3.  Jangan refactor tanpa diminta.
4.  Selalu gunakan DTO.
5.  Semua business logic di Service.
6.  Controller hanya menerima request dan mengembalikan response.
7.  Gunakan Repository TypeORM.
8.  Gunakan UUID.
9.  Semua endpoint selain login/register menggunakan JWT.
10. Setelah setiap task tampilkan:

-   File dibuat
-   File diubah
-   Endpoint baru
-   Cara test Postman

## 4. Struktur Project

``` text
backend/
├── src/
│   ├── auth/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   ├── strategies/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   └── auth.service.ts
│   ├── users/
│   ├── categories/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   ├── common/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── decorators/
│   │   ├── utils/
│   │   └── constants/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── package.json
└── README.md
```

## 5. Database

### users

-   id (uuid)
-   name
-   email (unique)
-   password
-   role
-   createdAt

### categories

-   id
-   name
-   image

### products

-   id
-   name
-   description
-   price
-   stock
-   image
-   categoryId

### cart

-   id
-   userId
-   productId
-   quantity

### orders

-   id
-   userId
-   totalPrice
-   status

### order_items

-   id
-   orderId
-   productId
-   quantity
-   price

## 6. Modules

-   Auth
-   Users
-   Categories
-   Products
-   Cart
-   Orders

## 7. API Contract

### Auth

POST /auth/register POST /auth/login GET /auth/profile

### Users

GET /users/profile

### Categories

GET /categories GET /categories/:id POST /categories PATCH
/categories/:id DELETE /categories/:id

### Products

GET /products GET /products/:id GET /products/category/:id POST
/products PATCH /products/:id DELETE /products/:id

### Cart

GET /cart POST /cart PATCH /cart/:id DELETE /cart/:id

### Orders

POST /orders GET /orders GET /orders/:id

## 8. Response Standard

Success

``` json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error

``` json
{
  "success": false,
  "message": "Error"
}
```

## 9. Environment

``` env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=electronic_store

JWT_SECRET=change_me
JWT_EXPIRES=7d
```

## 10. Definition of Done

-   Semua endpoint berjalan.
-   Swagger aktif.
-   Validasi DTO lengkap.
-   JWT berjalan.
-   Password di-hash.
-   Testing Postman berhasil.
-   Struktur project tetap sesuai PRD.
-   Tidak ada perubahan file di luar scope task.

## 11. AI Coding Prompt

Selalu ikuti PRD ini sebagai sumber utama.

-   Jangan mengubah file di luar task.
-   Jangan mengubah endpoint tanpa instruksi.
-   Jangan mengubah struktur folder.
-   Gunakan clean code.
-   Gunakan NestJS Best Practice.
-   Setelah setiap task tampilkan file yang dibuat, file yang diubah,
    endpoint baru, dan cara pengujian.
