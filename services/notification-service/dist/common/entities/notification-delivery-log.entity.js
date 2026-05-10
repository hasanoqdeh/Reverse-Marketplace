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
exports.NotificationDeliveryLog = void 0;
const typeorm_1 = require("typeorm");
const notification_entity_1 = require("./notification.entity");
let NotificationDeliveryLog = class NotificationDeliveryLog {
};
exports.NotificationDeliveryLog = NotificationDeliveryLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NotificationDeliveryLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], NotificationDeliveryLog.prototype, "notification_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: notification_entity_1.DeliveryChannel,
    }),
    __metadata("design:type", String)
], NotificationDeliveryLog.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: notification_entity_1.DeliveryLogStatus,
        default: notification_entity_1.DeliveryLogStatus.PENDING,
    }),
    __metadata("design:type", String)
], NotificationDeliveryLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], NotificationDeliveryLog.prototype, "failure_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], NotificationDeliveryLog.prototype, "delivered_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotificationDeliveryLog.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => notification_entity_1.Notification, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'notification_id' }),
    __metadata("design:type", notification_entity_1.Notification)
], NotificationDeliveryLog.prototype, "notification", void 0);
exports.NotificationDeliveryLog = NotificationDeliveryLog = __decorate([
    (0, typeorm_1.Entity)('notification_delivery_logs'),
    (0, typeorm_1.Index)(['notification_id']),
    (0, typeorm_1.Index)(['channel']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['delivered_at'])
], NotificationDeliveryLog);
//# sourceMappingURL=notification-delivery-log.entity.js.map