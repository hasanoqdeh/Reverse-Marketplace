'use strict';

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: object
 *           properties:
 *             message: { type: string }
 *             code:    { type: string }
 *
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         page:       { type: integer }
 *         limit:      { type: integer }
 *         total:      { type: integer }
 *         totalPages: { type: integer }
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         firstName:       { type: string }
 *         lastName:        { type: string }
 *         profileImageUrl: { type: string, format: uri, nullable: true }
 *         locationLat:     { type: number, nullable: true }
 *         locationLng:     { type: number, nullable: true }
 *         address:         { type: string, nullable: true }
 *         city:            { type: string, nullable: true }
 *         country:         { type: string, nullable: true }
 *
 *     User:
 *       type: object
 *       properties:
 *         id:            { type: string, format: uuid }
 *         phone:         { type: string }
 *         role:          { type: string, enum: [BUYER, MERCHANT, ADMIN] }
 *         status:        { type: string, enum: [PENDING, ACTIVE, BANNED, SUSPENDED] }
 *         phoneVerified: { type: boolean }
 *         adminSubRole:  { type: string, enum: [SUPER_ADMIN, ADMIN, SUPPORT], nullable: true }
 *         createdAt:     { type: string, format: date-time }
 *         lastLoginAt:   { type: string, format: date-time, nullable: true }
 *         profile:
 *           $ref: '#/components/schemas/UserProfile'
 *
 *     AuthTokens:
 *       type: object
 *       properties:
 *         accessToken:  { type: string }
 *         refreshToken: { type: string }
 *         expiresIn:    { type: integer, description: Access token TTL in seconds }
 *
 *     RequestCategory:
 *       type: object
 *       properties:
 *         id:          { type: string, format: uuid }
 *         name:        { type: string }
 *         slug:        { type: string }
 *         description: { type: string, nullable: true }
 *         iconUrl:     { type: string, format: uri, nullable: true }
 *         isActive:    { type: boolean }
 *         sortOrder:   { type: integer }
 *         parentId:    { type: string, format: uuid, nullable: true }
 *
 *     Request:
 *       type: object
 *       properties:
 *         id:              { type: string, format: uuid }
 *         buyerId:         { type: string, format: uuid }
 *         categoryId:      { type: string, format: uuid }
 *         title:           { type: string }
 *         description:     { type: string }
 *         budgetMin:       { type: number }
 *         budgetMax:       { type: number }
 *         status:
 *           type: string
 *           enum: [DRAFT, ACTIVE, HAS_BIDS, COMPLETED, CANCELLED, EXPIRED]
 *         bidCount:        { type: integer }
 *         viewCount:       { type: integer }
 *         expiresAt:       { type: string, format: date-time, nullable: true }
 *         publishedAt:     { type: string, format: date-time, nullable: true }
 *         locationAddress: { type: string, nullable: true }
 *         locationCity:    { type: string, nullable: true }
 *         locationCountry: { type: string, nullable: true }
 *
 *     Bid:
 *       type: object
 *       properties:
 *         id:               { type: string, format: uuid }
 *         requestId:        { type: string, format: uuid }
 *         merchantId:       { type: string, format: uuid }
 *         amount:           { type: number }
 *         deliveryDays:     { type: integer }
 *         deliveryNotes:    { type: string, nullable: true }
 *         specialTerms:     { type: string, nullable: true }
 *         status:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED, EXPIRED, WITHDRAWN]
 *         fulfillmentStatus:
 *           type: string
 *           enum: [AWAITING, PREPARING, IN_DELIVERY, DELIVERED, CONFIRMED]
 *           nullable: true
 *         chatRoomId:    { type: string, format: uuid, nullable: true }
 *         createdAt:     { type: string, format: date-time }
 *         expiresAt:     { type: string, format: date-time, nullable: true }
 *         acceptedAt:    { type: string, format: date-time, nullable: true }
 *
 *     ChatRoom:
 *       type: object
 *       properties:
 *         id:               { type: string, format: uuid }
 *         name:             { type: string, nullable: true }
 *         type:
 *           type: string
 *           enum: [DIRECT, GROUP, REQUEST, BID, SUPPORT]
 *         relatedRequestId: { type: string, format: uuid, nullable: true }
 *         relatedBidId:     { type: string, format: uuid, nullable: true }
 *         createdBy:        { type: string, format: uuid }
 *         isActive:         { type: boolean }
 *         lastMessageAt:    { type: string, format: date-time, nullable: true }
 *
 *     ChatMessage:
 *       type: object
 *       properties:
 *         id:        { type: string }
 *         roomId:    { type: string, format: uuid }
 *         senderId:  { type: string, format: uuid }
 *         type:
 *           type: string
 *           enum: [TEXT, IMAGE, FILE, VOICE, VIDEO, LOCATION, SYSTEM]
 *         content:   { type: string }
 *         mediaUrls: { type: array, items: { type: string, format: uri } }
 *         isDeleted: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *
 *     Notification:
 *       type: object
 *       properties:
 *         id:        { type: string, format: uuid }
 *         userId:    { type: string, format: uuid }
 *         type:
 *           type: string
 *           enum: [NEW_MESSAGE, BID_PLACED, STATUS_IN_DELIVERY, BID_ACCEPTED, BUYER_REVIEW]
 *         title:     { type: string }
 *         body:      { type: string }
 *         data:      { type: object, nullable: true }
 *         isRead:    { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *
 *     Review:
 *       type: object
 *       properties:
 *         id:         { type: string, format: uuid }
 *         bidId:      { type: string, format: uuid }
 *         requestId:  { type: string, format: uuid }
 *         reviewerId: { type: string, format: uuid }
 *         revieweeId: { type: string, format: uuid }
 *         type:
 *           type: string
 *           enum: [BUYER_TO_MERCHANT, MERCHANT_TO_BUYER]
 *         rating:    { type: integer, minimum: 1, maximum: 5 }
 *         comment:   { type: string, nullable: true }
 *         createdAt: { type: string, format: date-time }
 */
