"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.DeliveryLogStatus = exports.DeliveryChannel = exports.NotificationType = exports.DeliveryStatus = void 0;
const typeorm_1 = require("typeorm");
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["PENDING"] = "PENDING";
    DeliveryStatus["DELIVERED"] = "DELIVERED";
    DeliveryStatus["FAILED"] = "FAILED";
    DeliveryStatus["READ"] = "READ";
    DeliveryStatus["RETRYING"] = "RETRYING";
})(DeliveryStatus || (exports.DeliveryStatus = DeliveryStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["MATCH_FOUND"] = "MATCH_FOUND";
    NotificationType["BID_SUBMITTED"] = "BID_SUBMITTED";
    NotificationType["BID_ACCEPTED"] = "BID_ACCEPTED";
    NotificationType["BID_REJECTED"] = "BID_REJECTED";
    NotificationType["BID_EXPIRED"] = "BID_EXPIRED";
    NotificationType["REQUEST_COMPLETED"] = "REQUEST_COMPLETED";
    NotificationType["REQUEST_CANCELLED"] = "REQUEST_CANCELLED";
    NotificationType["USER_BANNED"] = "USER_BANNED";
    NotificationType["SYSTEM"] = "SYSTEM";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var DeliveryChannel;
(function (DeliveryChannel) {
    DeliveryChannel["SOCKET"] = "SOCKET";
    DeliveryChannel["FCM"] = "FCM";
    DeliveryChannel["APNS"] = "APNS";
})(DeliveryChannel || (exports.DeliveryChannel = DeliveryChannel = {}));
var DeliveryLogStatus;
(function (DeliveryLogStatus) {
    DeliveryLogStatus["PENDING"] = "PENDING";
    DeliveryLogStatus["DELIVERED"] = "DELIVERED";
    DeliveryLogStatus["FAILED"] = "FAILED";
    DeliveryLogStatus["RETRYING"] = "RETRYING";
})(DeliveryLogStatus || (exports.DeliveryLogStatus = DeliveryLogStatus = {}));
let Notification = class Notification {
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Notification.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationType,
    }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Notification.prototype, "body", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DeliveryStatus,
        default: DeliveryStatus.PENDING,
    }),
    __metadata("design:type", String)
], Notification.prototype, "delivery_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "is_read", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Notification.prototype, "created_at", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)('notifications'),
    (0, typeorm_1.Index)(['user_id']),
    (0, typeorm_1.Index)(['delivery_status']),
    (0, typeorm_1.Index)(['is_read']),
    (0, typeorm_1.Index)(['created_at'])
], Notification);
//# sourceMappingURL=notification.entity.js.map